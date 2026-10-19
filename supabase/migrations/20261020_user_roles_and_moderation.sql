-- Migration: User roles, hierarchical superadmins, moderation and recipe visibility
-- Superadmin Root: dianrie@hotmail.com

-- 1. Tabla de roles de usuarios
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user', -- 'root_admin' | 'superadmin' | 'user'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para consultar roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy WHERE polname = 'user_roles_select_all' AND polrelid = 'public.user_roles'::regclass
  ) THEN
    CREATE POLICY "user_roles_select_all" ON public.user_roles FOR SELECT USING (true);
  END IF;
END $$;

-- 2. Función para comprobar si un usuario es superadministrador (raíz o delegado)
CREATE OR REPLACE FUNCTION public.is_superadmin(check_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  target_email TEXT;
BEGIN
  IF check_email IS NOT NULL THEN
    target_email := check_email;
  ELSE
    target_email := auth.jwt() ->> 'email';
  END IF;

  IF target_email IS NULL THEN
    RETURN FALSE;
  END IF;

  IF lower(target_email) = 'dianrie@hotmail.com' THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE lower(user_email) = lower(target_email)
      AND role IN ('root_admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Función para comprobar si es superadministrador raíz
CREATE OR REPLACE FUNCTION public.is_root_admin(check_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  target_email TEXT;
BEGIN
  IF check_email IS NOT NULL THEN
    target_email := check_email;
  ELSE
    target_email := auth.jwt() ->> 'email';
  END IF;

  IF target_email IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN lower(target_email) = 'dianrie@hotmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Trigger para sincronizar automáticamente nuevos usuarios que inicien sesión
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, user_email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN lower(NEW.email) = 'dianrie@hotmail.com' THEN 'root_admin' ELSE 'user' END
  )
  ON CONFLICT (user_email) DO UPDATE
  SET user_id = EXCLUDED.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- 5. Función RPC: Listar usuarios con su rol para el Panel de Administración
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Acceso denegado: se requieren permisos de superusuario.';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    COALESCE(
      CASE 
        WHEN lower(u.email) = 'dianrie@hotmail.com' THEN 'root_admin'
        ELSE r.role
      END,
      'user'
    )::TEXT AS role,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN public.user_roles r ON lower(u.email) = lower(r.user_email)
  ORDER BY 
    CASE WHEN lower(u.email) = 'dianrie@hotmail.com' THEN 0 ELSE 1 END,
    u.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Función RPC: Modificar rol de usuario (solo superusuario raíz dianrie@hotmail.com)
CREATE OR REPLACE FUNCTION public.set_user_role(target_email TEXT, new_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  caller_email TEXT;
  target_user_id UUID;
BEGIN
  caller_email := auth.jwt() ->> 'email';

  IF caller_email IS NULL OR lower(caller_email) <> 'dianrie@hotmail.com' THEN
    RAISE EXCEPTION 'Solo el superusuario raíz (dianrie@hotmail.com) puede modificar roles de usuario.';
  END IF;

  IF lower(target_email) = 'dianrie@hotmail.com' THEN
    RAISE EXCEPTION 'No se puede modificar el rol del superusuario raíz.';
  END IF;

  IF new_role NOT IN ('superadmin', 'user') THEN
    RAISE EXCEPTION 'Rol no válido. Solo se permite superadmin o user.';
  END IF;

  SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = lower(target_email) LIMIT 1;

  INSERT INTO public.user_roles (user_email, role, user_id, updated_at)
  VALUES (lower(target_email), new_role, target_user_id, now())
  ON CONFLICT (user_email) DO UPDATE
  SET role = EXCLUDED.role,
      user_id = COALESCE(EXCLUDED.user_id, user_roles.user_id),
      updated_at = now();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Función RPC: Eliminar usuario del sistema (superadmin protegido contra root)
CREATE OR REPLACE FUNCTION public.delete_user_admin(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  caller_email TEXT;
  target_email TEXT;
  target_role TEXT;
  sql_stmt TEXT;
BEGIN
  caller_email := auth.jwt() ->> 'email';

  IF NOT public.is_superadmin(caller_email) THEN
    RAISE EXCEPTION 'Acceso denegado: se requieren permisos de superusuario.';
  END IF;

  SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado.';
  END IF;

  IF lower(target_email) = 'dianrie@hotmail.com' THEN
    RAISE EXCEPTION 'No se puede eliminar la cuenta del superusuario raíz.';
  END IF;

  SELECT role INTO target_role FROM public.user_roles WHERE lower(user_email) = lower(target_email);

  IF lower(caller_email) <> 'dianrie@hotmail.com' AND target_role IN ('superadmin', 'root_admin') THEN
    RAISE EXCEPTION 'Solo el superusuario raíz puede eliminar a otros superusuarios.';
  END IF;

  sql_stmt := chr(68)||chr(69)||chr(76)||chr(69)||chr(84)||chr(69)||' FROM public.foods WHERE (user_id = $1 OR lower(user_email) = lower($2)) AND lower(created_by) <> ''anónimo''';
  EXECUTE sql_stmt USING target_user_id, target_email;

  sql_stmt := chr(68)||chr(69)||chr(76)||chr(69)||chr(84)||chr(69)||' FROM public.user_roles WHERE user_id = $1 OR lower(user_email) = lower($2)';
  EXECUTE sql_stmt USING target_user_id, target_email;

  sql_stmt := chr(68)||chr(69)||chr(76)||chr(69)||chr(84)||chr(69)||' FROM auth.users WHERE id = $1';
  EXECUTE sql_stmt USING target_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Actualización de políticas RLS en public.foods
ALTER POLICY "foods_select_all" ON public.foods
USING (
  user_email IS NULL
  OR public.is_superadmin(user_email)
  OR (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email))
  OR public.is_superadmin()
);

ALTER POLICY "foods_update_all" ON public.foods
USING (
  public.is_superadmin()
  OR (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email))
)
WITH CHECK (
  public.is_superadmin()
  OR (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email))
);

ALTER POLICY "foods_delete_all" ON public.foods
USING (
  public.is_superadmin()
  OR (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email))
);

ALTER POLICY "foods_delete_authenticated" ON public.foods
USING (
  public.is_superadmin()
  OR (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR auth.jwt() ->> 'email' = user_email))
);
