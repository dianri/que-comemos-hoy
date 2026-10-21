import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Save, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCategories } from '../context/CategoryContext';
import { Food, getFoodCategories } from '../types';
import { ImagePicker } from './ImagePicker';
import { sanitizeText, safeImageUrl, SAFE_FALLBACK_IMAGE } from '../lib/sanitize';
import { generateDishDescription } from '../lib/aiDescription';
import { showToast } from '../lib/toast';

interface EditFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: Food | null;
  onFoodUpdated: (updatedFood: Food) => void;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  isOpen,
  onClose,
  food,
  onFoodUpdated,
}) => {
  const { categories } = useCategories();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['General']);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateAiDescription = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast('Escribe primero el nombre del plato', 'info');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const generated = await generateDishDescription(
        trimmedName,
        selectedCategories.length > 0 ? selectedCategories[0] : undefined
      );
      if (generated) {
        setDescription(generated);
        showToast('¡Descripción generada con éxito! ✨', 'success');
      }
    } catch (err: unknown) {
      console.error('Error generating AI description:', err);
      showToast('No se pudo generar la descripción. Inténtalo de nuevo.', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Prellenar campos al cambiar el plato a editar
  useEffect(() => {
    if (food) {
      setName(food.name || '');
      setImageUrl(food.image_url || '');
      setSelectedCategories(getFoodCategories(food));
      setDescription(food.description || '');
      setErrorMsg(null);
    }
  }, [food]);

  if (!isOpen || !food) return null;

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev; // Mantener al menos una categoría seleccionada
        return prev.filter((c) => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitizar inputs de texto antes de validar
    const safeName = sanitizeText(name);
    const safeDescription = sanitizeText(description);

    if (!safeName) {
      setErrorMsg('Por favor introduce el nombre del plato.');
      return;
    }

    // Validar URL de imagen: si no está vacía debe ser https://
    const rawImageUrl = imageUrl.trim();
    const finalImage = rawImageUrl
      ? safeImageUrl(rawImageUrl)
      : SAFE_FALLBACK_IMAGE;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const finalCategories = selectedCategories.length > 0 ? selectedCategories : ['General'];
      const primaryCategory = finalCategories[0] || 'General';

      const { data, error } = await supabase
        .from('foods')
        .update({
          name: safeName,
          image_url: finalImage,
          category: primaryCategory,
          categories: finalCategories,
          description: safeDescription,
        })
        .eq('id', food.id)
        .select()
        .single();

      if (error) throw error;

      // Actualización optimista garantizada: si data no estuviera presente por algún motivo, fusionar con el objeto anterior
      const updatedFoodRecord: Food = (data as Food) || {
        ...food,
        name: safeName,
        image_url: finalImage,
        category: primaryCategory,
        categories: finalCategories,
        description: safeDescription,
      };

      onFoodUpdated(updatedFoodRecord);
      onClose();
    } catch (err: unknown) {
      console.error('Error al actualizar plato:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Error al guardar los cambios en Supabase.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="mb-3.5 sm:mb-4">
          <div className="flex items-center space-x-1.5 text-orange-600 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Modificar Receta</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
            Editar Plato
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Modifica los detalles, categoría o foto de este plato.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Nombre del plato */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nombre del Plato *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Paella, Pizza..."
              className="w-full h-9 sm:h-10 px-3 py-1 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-xs sm:text-sm font-medium"
            />
          </div>

          {/* Categorías Múltiples */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Categorías ({selectedCategories.length})
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Selecciona una o varias
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/80 border border-slate-200 rounded-xl max-h-32 overflow-y-auto">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Imagen con Buscador y Pestañas */}
          <div>
            <ImagePicker selectedUrl={imageUrl} onSelectUrl={setImageUrl} foodName={name} />
          </div>


          {/* Descripción opcional con autocompletado por IA */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Descripción corta (Opcional)
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={isGeneratingAi || !name.trim()}
                title={!name.trim() ? 'Escribe primero el nombre del plato' : 'Generar sugerencia apetitosa con IA'}
                className="inline-flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95 cursor-pointer"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400/40" />
                    <span>Autocompletar con IA</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredientes, detalles de preparación..."
              rows={2}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-xs sm:text-sm resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-1 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
