import React, { useState } from 'react';
import { X, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { Category, Food } from '../types';
import { ImagePicker } from './ImagePicker';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodAdded: (newFood: Food) => void;
}

const CATEGORIES: Category[] = [
  'Tradicional',
  'Carnes',
  'Pescados',
  'Sopas',
  'Arroces',
  'Italiana',
  'Americana',
  'Mexicana',
  'Japonesa',
  'Saludable',
  'General',
];

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  onFoodAdded,
}) => {
  const { user, isAuthenticated, openAuthModal } = useUser();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<Category>('General');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setErrorMsg('Debes iniciar sesión con tu correo para añadir platos a la carta.');
      openAuthModal('Inicia sesión con tu correo para añadir platos.');
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Por favor introduce el nombre del plato.');
      return;
    }

    const finalImage =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // Atribución de creador basada estrictamente en el ID único (auth.uid) y email
      const creatorUid = user?.id || '';
      const creatorEmail = user?.email || '';

      const newRecord = {
        name: name.trim(),
        image_url: finalImage,
        category,
        description: description.trim(),
        votes_count: 0,
        created_by: creatorUid,
        user_id: user?.id,
        user_email: creatorEmail,
      };

      const { data, error } = await supabase
        .from('foods')
        .insert([newRecord])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onFoodAdded(data as Food);
        setName('');
        setImageUrl('');
        setDescription('');
        setCategory('General');
        onClose();
      }
    } catch (err: unknown) {
      console.error('Error al guardar plato:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Error al guardar el plato en Supabase.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 max-h-[90vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="mb-5">
          <div className="flex items-center space-x-2 text-orange-600 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Nueva Comida</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Añadir plato a la carta
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Añade un plato delicioso para que entre en la ruleta y todos puedan votarlo.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del plato */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre del Plato *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Espaguetis a la marinera, Tortilla..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm font-medium"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm font-medium bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Imagen con Buscador y Pestañas */}
          <div>
            <ImagePicker selectedUrl={imageUrl} onSelectUrl={setImageUrl} foodName={name} />
          </div>


          {/* Descripción opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción corta (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredientes clave, salsa especial o detalles..."
              rows={2}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Añadir a la Carta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
