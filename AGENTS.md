# 🤖 AGENTS.md: Manual del Proyecto "que-comemos-hoy"

Este documento define las reglas de estilo, la arquitectura y las convenciones técnicas que deben seguirse al desarrollar o modificar este proyecto.

## 1. Filosofía y Estilo
- **Frontend:** La interfaz debe ser moderna, limpia, minimalista y altamente visual, siguiendo la estética de una aplicación móvil nativa de alta calidad (App-like).
- **UI/UX:** Priorizar la facilidad de uso. Los elementos deben tener transiciones suaves y ser "touch-friendly".
- **Visuales:** Usar Tailwind CSS para el diseño. Todas las fotos de comida deben ser de alta calidad y ocupar un lugar central en las tarjetas.

## 2. Arquitectura Técnica
- **Framework:** React (con Vite) usando TypeScript.
- **Estilizado:** Tailwind CSS.
- **Base de Datos / Backend:** Supabase.
- **Despliegue:** Vercel.

## 3. Estructura de Carpetas
- `/src`: Código fuente principal.
  - `/components`: Componentes reutilizables (UI, Cards, Modals).
  - `/lib`: Configuraciones e inicialización (ej. `supabase.ts`).
  - `/types`: Definiciones de TypeScript (ej. `Database.types.ts`).
- `/public`: Recursos estáticos.

## 4. Reglas de Componentes Críticos
### `RouletteModal.tsx` (La Ruleta)
- La ruleta se dibuja dinámicamente en un elemento HTML5 Canvas.
- **Regla de Oro:** El texto debe estar perfectamente centrado y legible dentro de su segmento. La lógica de selección del ganador debe estar sincronizada con la posición visual de la flecha roja fija (12 en punto).
- El sonido (Web Audio API) y el confeti (`canvas-confetti`) son obligatorios al detenerse.

### `FoodCard.tsx` (Tarjetas de Plato)
- Deben ser tarjetas con la imagen de fondo o imagen principal destacada.
- El contador de votos debe actualizarse en tiempo real gracias a Supabase Realtime y el trigger de base de datos.
- Incluir badge de categoría y botón de eliminación.

### `AddFoodModal.tsx` (Añadir Plato)
- Formulario rápido con UX optimizada. Validación simple.
- Opcional: Botones de "fotos rápidas" (URLs predefinidas) para añadir platos en 1 clic.

## 5. Flujo de Datos y Convenciones de Base de Datos
- Las tablas principales son `public.foods` y `public.votes`.
- Se utiliza un **Trigger en PostgreSQL** para mantener el campo `votes_count` de la tabla `foods` siempre sincronizado con la suma de la tabla `votes`. Esto evita calcular los votos en el frontend.
- Las Políticas RLS están configuradas para permitir lectura, inserción y votación pública, pero la eliminación de platos debe estar protegida (asegurar que el `created_by` coincide con el usuario actual si se implementa autenticación fuerte en el futuro).

## 6. Autenticación Ligera
- No hay sistema de login/contraseña. Se utiliza un sistema de "perfil local" (nombre de usuario guardado en `localStorage`) para identificar quién vota, gestionado en `Navbar.tsx`.
- El campo `user_name` en la tabla `votes` corresponde a este nombre local.

Al realizar cambios, asegúrate de mantener la coherencia con esta arquitectura y de no introducir errores de compilación (TypeScript).
