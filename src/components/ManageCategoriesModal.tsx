import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Loader2,
  Check,
} from 'lucide-react';
import { useCategories } from '../context/CategoryContext';
import { useUser } from '../context/UserContext';
import { Food, getFoodCategories } from '../types';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: Food[];
  onFoodsReassigned?: () => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  foods,
  onFoodsReassigned,
}) => {
  const { isSuperUser } = useUser();
  const { categories, addCategory, deleteCategory } = useCategories();

  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Categoría pendiente de confirmación para eliminar
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !isSuperUser) return null;

  // Conteo de platos por categoría (soporta múltiples categorías por plato)
  const countFoodsInCategory = (catName: string): number => {
    const target = catName.toLowerCase();
    return foods.filter((f) => {
      const cats = getFoodCategories(f);
      return cats.some((c) => c.toLowerCase() === target);
    }).length;
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const name = newCatName.trim();
    if (!name) return;

    setIsAdding(true);
    const res = await addCategory(name);
    setIsAdding(false);

    if (res.success) {
      setNewCatName('');
      setSuccessMsg(`Categoría "${name}" añadida correctamente.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setErrorMsg(res.error || 'Error al añadir categoría.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCat) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsDeleting(true);

    const target = deletingCat;
    const res = await deleteCategory(target, onFoodsReassigned);
    setIsDeleting(false);
    setDeletingCat(null);

    if (res.success) {
      setSuccessMsg(`Categoría "${target}" eliminada y platos reasignados a General.`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } else {
      setErrorMsg(res.error || 'Error al eliminar categoría.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Cabecera */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Gestión de Categorías y Filtros
                </h3>
                <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  <span>Superadmin</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Añade o elimina filtros visibles para todos los usuarios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario de añadir nueva categoría */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white">
          <form onSubmit={handleAddCategory} className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
              <span>Nueva Categoría</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ej. Tacos, Vegana, Platos de cuchara..."
                maxLength={30}
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 bg-slate-50/60"
              />
              <button
                type="submit"
                disabled={isAdding || !newCatName.trim()}
                className="px-4 h-10 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-orange-600/20 transition-all shrink-0 cursor-pointer"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Añadir</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Avisos */}
          {errorMsg && (
            <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-2.5 flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Lista de Categorías Existentes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Categorías activas ({categories.length})</span>
            <span>Platos vinculados</span>
          </div>

          <div className="space-y-1.5">
            {categories.map((cat) => {
              const isBase = cat.toLowerCase() === 'general';
              const foodCount = countFoodsInCategory(cat);

              return (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <span className="text-base sm:text-lg">🍽️</span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {cat}
                      </p>
                      {isBase && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          Categoría base del sistema (no eliminable)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                      {foodCount} {foodCount === 1 ? 'plato' : 'platos'}
                    </span>

                    {isBase ? (
                      <div
                        className="p-1.5 text-slate-300"
                        title="La categoría General está protegida"
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingCat(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={`Eliminar categoría "${cat}"`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de confirmación para eliminar */}
        {deletingCat && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-sm w-full border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-bold text-slate-900">
                  ¿Eliminar categoría "{deletingCat}"?
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {countFoodsInCategory(deletingCat) > 0 ? (
                    <>
                      Hay{' '}
                      <strong>
                        {countFoodsInCategory(deletingCat)} platos
                      </strong>{' '}
                      con esta categoría. Se reasignarán automáticamente a{' '}
                      <strong>"General"</strong> para no perder ningún plato.
                    </>
                  ) : (
                    'No hay ningún plato vinculado a esta categoría actualmente.'
                  )}
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCat(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center space-x-1"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Sí, eliminar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pie */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
