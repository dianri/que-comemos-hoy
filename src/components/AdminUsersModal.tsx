import React, { useEffect, useState } from 'react';
import {
  X,
  Users,
  ShieldCheck,
  ShieldAlert,
  ShieldPlus,
  ShieldMinus,
  Trash2,
  Crown,
  Search,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  User as UserIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { AdminUserItem, UserRole } from '../types';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted?: () => void;
}

const ROOT_EMAIL = 'dianrie@hotmail.com';

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({
  isOpen,
  onClose,
  onUserDeleted,
}) => {
  const { user, isRootSuperAdmin, isSuperUser, refreshRoles } = useUser();
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Estado para confirmación de borrado
  const [userToDelete, setUserToDelete] = useState<AdminUserItem | null>(null);

  // Cargar lista de usuarios desde la función RPC de Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase.rpc('get_admin_users');
      if (error) throw error;
      setUsersList((data as AdminUserItem[]) || []);
    } catch (err: unknown) {
      console.error('Error al cargar usuarios:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Error al obtener la lista de usuarios desde Supabase.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isSuperUser) {
      fetchUsers();
    }
  }, [isOpen, isSuperUser]);

  // Si no está abierto o no es superusuario, no renderizar nada
  if (!isOpen || !isSuperUser) return null;

  // Filtrado de usuarios por buscador
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  // Estadísticas rápidas
  const totalUsers = usersList.length;
  const superadminsCount = usersList.filter(
    (u) => u.role === 'root_admin' || u.role === 'superadmin' || u.email.toLowerCase() === ROOT_EMAIL
  ).length;
  const regularUsersCount = totalUsers - superadminsCount;

  // Cambiar rol de usuario (solo superusuario raíz)
  const handleToggleRole = async (targetUser: AdminUserItem) => {
    if (!isRootSuperAdmin) return;
    if (targetUser.email.toLowerCase() === ROOT_EMAIL) return;

    const nextRole: UserRole = targetUser.role === 'superadmin' ? 'user' : 'superadmin';
    const actionText = nextRole === 'superadmin' ? 'promover a Superusuario' : 'degradar a Usuario Normal';

    if (!window.confirm(`¿Seguro que deseas ${actionText} a "${targetUser.email}"?`)) {
      return;
    }

    try {
      setActionLoadingId(targetUser.id);
      setErrorMsg(null);
      setSuccessMsg(null);

      const { error } = await supabase.rpc('set_user_role', {
        target_email: targetUser.email,
        new_role: nextRole,
      });

      if (error) throw error;

      setSuccessMsg(
        `Rol actualizado con éxito: ${targetUser.email} ahora es ${
          nextRole === 'superadmin' ? 'Superusuario 🛡️' : 'Usuario Normal 👤'
        }.`
      );

      await fetchUsers();
      await refreshRoles();
    } catch (err: unknown) {
      console.error('Error al cambiar rol:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al actualizar el rol de usuario.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Confirmar y ejecutar eliminación de usuario
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setActionLoadingId(userToDelete.id);
      setErrorMsg(null);
      setSuccessMsg(null);

      const { error } = await supabase.rpc('delete_user_admin', {
        target_user_id: userToDelete.id,
      });

      if (error) throw error;

      setSuccessMsg(`Usuario "${userToDelete.email}" eliminado correctamente del sistema.`);
      setUserToDelete(null);

      await fetchUsers();
      await refreshRoles();
      if (onUserDeleted) onUserDeleted();
    } catch (err: unknown) {
      console.error('Error al eliminar usuario:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar el usuario.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-slate-50 to-orange-50/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors shadow-sm"
            title="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-purple-700 mb-1">
            {isRootSuperAdmin ? (
              <Crown className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            )}
            <span className="text-xs font-black uppercase tracking-wider">
              {isRootSuperAdmin ? 'Superusuario Raíz' : 'Superusuario Administrador'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Panel de Administración de Usuarios
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Control de accesos, roles administrativos y gestión de cuentas del sistema.
          </p>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
            <div className="p-2.5 sm:p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Total Usuarios</span>
              <p className="text-base sm:text-xl font-black text-slate-800">{totalUsers}</p>
            </div>
            <div className="p-2.5 sm:p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/80 shadow-xs">
              <span className="text-[10px] sm:text-xs font-bold text-purple-600 uppercase">Superusuarios</span>
              <p className="text-base sm:text-xl font-black text-purple-700">{superadminsCount}</p>
            </div>
            <div className="p-2.5 sm:p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Usuarios Normales</span>
              <p className="text-base sm:text-xl font-black text-slate-700">{regularUsersCount}</p>
            </div>
          </div>
        </div>

        {/* Notificaciones de error o éxito */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Barra de búsqueda y acciones */}
        <div className="p-4 sm:px-6 sm:py-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por email o rol..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 bg-slate-50/50"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-xs"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>

        {/* Lista de Usuarios */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {loading && usersList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin text-purple-500" />
              <p className="text-xs font-semibold">Cargando lista de usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <Users className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No se encontraron usuarios</p>
              <p className="text-[11px] text-slate-400">Prueba con otro término de búsqueda.</p>
            </div>
          ) : (
            filteredUsers.map((item) => {
              const isRoot = item.email.toLowerCase() === ROOT_EMAIL;
              const isTargetSuper = isRoot || item.role === 'superadmin' || item.role === 'root_admin';
              const isMe = item.email.toLowerCase() === user?.email?.toLowerCase();
              const isActing = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isRoot
                      ? 'bg-purple-50/60 border-purple-200/80 shadow-xs'
                      : isTargetSuper
                      ? 'bg-blue-50/40 border-blue-200/60'
                      : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Información del Usuario */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs ${
                        isRoot
                          ? 'bg-gradient-to-tr from-purple-600 to-amber-500 text-white'
                          : isTargetSuper
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isRoot ? '👑' : isTargetSuper ? '🛡️' : <UserIcon className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                          {item.email}
                        </p>
                        {isMe && (
                          <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
                            Tú
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span>
                          Registrado: {new Date(item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {item.last_sign_in_at && (
                          <span className="hidden sm:inline">
                            • Último acceso: {new Date(item.last_sign_in_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Insignia de Rol & Botones de Acción */}
                  <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                    {/* Badge de Rol */}
                    {isRoot ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-200 flex items-center space-x-1 shadow-xs">
                        <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Superusuario Raíz</span>
                      </span>
                    ) : isTargetSuper ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1 shadow-xs">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>Superusuario</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Usuario Normal
                      </span>
                    )}

                    {/* Botón de Cambiar Rol (Visible ÚNICAMENTE para el Superusuario Raíz) */}
                    {isRootSuperAdmin && !isRoot && (
                      <button
                        onClick={() => handleToggleRole(item)}
                        disabled={isActing}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-xs ${
                          isTargetSuper
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                        } disabled:opacity-50`}
                        title={isTargetSuper ? 'Degradar a usuario normal' : 'Promover a superusuario'}
                      >
                        {isTargetSuper ? (
                          <>
                            <ShieldMinus className="w-3 h-3 text-amber-600" />
                            <span className="hidden md:inline">Degradar</span>
                          </>
                        ) : (
                          <>
                            <ShieldPlus className="w-3 h-3 text-purple-600" />
                            <span className="hidden md:inline">Hacer Superadmin</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Botón de Borrar Usuario */}
                    {!isRoot && (!isTargetSuper || isRootSuperAdmin) && (
                      <button
                        onClick={() => setUserToDelete(item)}
                        disabled={isActing}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200 disabled:opacity-40"
                        title={`Eliminar usuario ${item.email}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {userToDelete && (
          <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-800">¿Eliminar usuario del sistema?</h3>
                <p className="text-xs text-slate-500">
                  Estás a punto de borrar definitivamente la cuenta de:
                </p>
                <p className="text-sm font-bold text-red-600 bg-red-50 py-1.5 px-3 rounded-xl inline-block mt-1">
                  {userToDelete.email}
                </p>
                <p className="text-[11px] text-slate-400 pt-1">
                  Esta acción eliminará su acceso y sus recetas no oficiales creadas. No se puede deshacer.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  disabled={actionLoadingId === userToDelete.id}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoadingId === userToDelete.id}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{actionLoadingId === userToDelete.id ? 'Eliminando...' : 'Sí, Eliminar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pie del modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistema de moderación activo</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition-colors shadow-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
