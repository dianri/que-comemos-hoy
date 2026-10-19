import React, { useState } from 'react';
import { UtensilsCrossed, User, Check, Edit2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface NavbarProps {
  totalFoods: number;
}

export const Navbar: React.FC<NavbarProps> = ({ totalFoods }) => {
  const { userName, setUserName } = useUser();
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
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-orange-100/80 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 bg-clip-text text-transparent">
              ¿Qué comemos hoy?
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {totalFoods} deliciosos platos para elegir
            </p>
          </div>
        </div>

        {/* User identification badge */}
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <form onSubmit={handleSave} className="flex items-center space-x-1.5">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                autoFocus
                placeholder="Tu nombre..."
                className="px-3 py-1 text-sm rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-white"
                maxLength={25}
              />
              <button
                type="submit"
                className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm"
                title="Guardar nombre"
              >
                <Check className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setInputName(userName);
                setIsEditing(true);
              }}
              className="group flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100/80 border border-orange-200/60 transition-all text-xs sm:text-sm font-medium text-orange-900 shadow-sm"
              title="Haz clic para cambiar tu nombre de votante"
            >
              <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-orange-700">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="max-w-[120px] sm:max-w-[180px] truncate">{userName}</span>
              <Edit2 className="w-3 h-3 text-orange-400 group-hover:text-orange-600 transition-colors" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
