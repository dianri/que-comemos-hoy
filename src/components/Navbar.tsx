import React, { useState } from 'react';
import {
  UtensilsCrossed,
  User as UserIcon,
  Check,
  Edit2,
  LogIn,
  LogOut,
  ShieldCheck,
  Crown,
  Users,
  Bell,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { isPushSupported, subscribeUserToPush } from '../lib/pushNotifications';

interface NavbarProps {
  totalFoods: number;
  pendingApprovalsCount?: number;
  onOpenModerationModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalFoods,
  pendingApprovalsCount = 0,
  onOpenModerationModal,
}) => {
  const {
    userName,
    setUserName,
    user,
    isAuthenticated,
    isSuperUser,
    isRootSuperAdmin,
    signOut,
    openAuthModal,
    openAdminModal,
  } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [inputName, setInputName] = useState(userName);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName.trim());
      setIsEditing(false);
    }
  };

  const handleBellClick = async () => {
    onOpenModerationModal?.();
    // Si el superusuario pulsa por primera vez la campana y no ha configurado notificaciones push, solicitar permiso amablemente
    if (isSuperUser && isPushSupported() && Notification.permission === 'default' && user) {
      try {
        await subscribeUserToPush(user.id, user.email || '');
      } catch (err) {
        console.warn('Aviso suscripción inicial push:', err);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100/80 shadow-xs transition-all">
      <div className="max-w-6xl mx-auto px-3 min-[400px]:px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Logo alineado a la izquierda */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
          <div className="w-7 h-7 min-[380px]:w-8 min-[380px]:h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0">
            <UtensilsCrossed className="w-3.5 h-3.5 min-[380px]:w-4 min-[380px]:h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs min-[360px]:text-sm sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent leading-none truncate">
              ¿Qué comemos hoy?
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block mt-0.5 truncate">
              {totalFoods} platos listos en la ruleta
            </p>
          </div>
        </div>

        {/* Zona derecha: Perfil y Autenticación alineados */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Nombre / Perfil de Voto: Solo visible si el usuario está autenticado */}
          {isAuthenticated && (
            isEditing ? (
              <form onSubmit={handleSave} className="flex items-center space-x-1">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  autoFocus
                  placeholder="Tu nombre..."
                  className="px-2 py-1 text-xs sm:text-sm rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-white w-20 min-[380px]:w-24 sm:w-32"
                  maxLength={25}
                />
                <button
                  type="submit"
                  className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-xs"
                  title="Guardar nombre"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setInputName(userName);
                  setIsEditing(true);
                }}
                className="group flex items-center space-x-1 sm:space-x-1.5 h-7 min-[380px]:h-8 sm:h-9 px-2 min-[380px]:px-2.5 rounded-full bg-orange-50 hover:bg-orange-100/80 border border-orange-200/60 transition-all text-xs font-semibold text-orange-950 shadow-xs flex-shrink-0"
                title="Haz clic para cambiar tu nombre de usuario"
              >
                <div className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 flex-shrink-0">
                  <UserIcon className="w-2.5 h-2.5 min-[380px]:w-3 min-[380px]:h-3" />
                </div>
                <span className="max-w-[48px] min-[360px]:max-w-[68px] min-[400px]:max-w-[90px] sm:max-w-[120px] truncate text-[11px] sm:text-xs">
                  {userName}
                </span>
                <Edit2 className="w-2.5 h-2.5 text-orange-400 group-hover:text-orange-600 transition-colors hidden min-[360px]:inline-block flex-shrink-0" />
              </button>
            )
          )}

          {/* Estado de Supabase Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1 min-[380px]:pl-1.5 border-l border-slate-200">
              {/* Botón de Moderación con Campana y Contador de Notificaciones (Exclusivo Superusuarios) */}
              {isSuperUser && (
                <button
                  onClick={handleBellClick}
                  className={`relative h-7 w-7 min-[380px]:h-8 min-[380px]:w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center flex-shrink-0 ${
                    pendingApprovalsCount > 0
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                  title={
                    pendingApprovalsCount > 0
                      ? `${pendingApprovalsCount} ${pendingApprovalsCount === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'} de aprobación de platos`
                      : 'Bandeja de moderación de platos'
                  }
                >
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {pendingApprovalsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] sm:min-w-[17px] sm:h-[17px] px-0.5 sm:px-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                      {pendingApprovalsCount > 99 ? '99+' : pendingApprovalsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Botón de Panel de Administración para Superusuarios */}
              {isSuperUser && (
                <button
                  onClick={openAdminModal}
                  className="h-7 min-[380px]:h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95 flex items-center justify-center space-x-1.5 flex-shrink-0"
                  title="Abrir Panel de Administración de Usuarios"
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">Usuarios</span>
                </button>
              )}

              {/* Indicador de Usuario y Rol */}
              <div
                className={`hidden md:flex items-center space-x-1.5 h-9 px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                  isRootSuperAdmin
                    ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                    : isSuperUser
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
                title={`Sesión iniciada como ${user?.email} ${
                  isRootSuperAdmin ? '(Superusuario Raíz)' : isSuperUser ? '(Superusuario)' : ''
                }`}
              >
                {isRootSuperAdmin ? (
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                ) : isSuperUser ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="max-w-[100px] lg:max-w-[120px] truncate">{user?.email}</span>
                {isSuperUser && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isRootSuperAdmin
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-purple-200 text-purple-800'
                    }`}
                  >
                    {isRootSuperAdmin ? 'Raíz' : 'Admin'}
                  </span>
                )}
              </div>

              <button
                onClick={signOut}
                className="h-7 min-[380px]:h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg sm:rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-all border border-slate-200 active:scale-95 flex items-center justify-center space-x-1 flex-shrink-0"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('Inicia sesión para poder añadir o eliminar platos de la carta.')}
              className="h-7 min-[380px]:h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1.5 flex-shrink-0"
              title="Iniciar sesión con Enlace Mágico"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
