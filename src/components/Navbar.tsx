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
} from 'lucide-react';
import { useUser } from '../context/UserContext';

interface NavbarProps {
  totalFoods: number;
}

export const Navbar: React.FC<NavbarProps> = ({ totalFoods }) => {
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

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100/80 shadow-xs transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo alineado a la izquierda */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent leading-none">
              ¿Qué comemos hoy?
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block mt-0.5">
              {totalFoods} platos listos en la ruleta
            </p>
          </div>
        </div>

        {/* Zona derecha: Perfil y Autenticación alineados */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
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
                  className="px-2.5 py-1 text-xs sm:text-sm rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-white max-w-[110px] sm:max-w-[140px]"
                  maxLength={25}
                />
                <button
                  type="submit"
                  className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm"
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
                className="group flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100/80 border border-orange-200/60 transition-all text-xs font-semibold text-orange-950 shadow-sm"
                title="Haz clic para cambiar tu nombre de usuario"
              >
                <div className="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center text-orange-700">
                  <UserIcon className="w-3 h-3" />
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{userName}</span>
                <Edit2 className="w-2.5 h-2.5 text-orange-400 group-hover:text-orange-600 transition-colors" />
              </button>
            )
          )}

          {/* Estado de Supabase Auth */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-1.5 pl-1 border-l border-slate-200">
              {/* Botón de Panel de Administración para Superusuarios */}
              {isSuperUser && (
                <button
                  onClick={openAdminModal}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95"
                  title="Abrir Panel de Administración de Usuarios"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Usuarios</span>
                </button>
              )}

              {/* Indicador de Usuario y Rol */}
              <div
                className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
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
                <span className="max-w-[110px] truncate">{user?.email}</span>
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
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-all border border-slate-200"
                title="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('Inicia sesión para poder añadir o eliminar platos de la carta.')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Iniciar sesión con Enlace Mágico"
            >
              <LogIn className="w-3.5 h-3.5 text-orange-400" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
