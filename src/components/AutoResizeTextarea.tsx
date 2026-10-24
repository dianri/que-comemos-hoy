import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  minHeight?: number;
}

/**
 * Componente de Textarea con auto-crecimiento dinámico (Auto-Resize).
 * Ajusta su altura automáticamente al contenido mediante `scrollHeight`,
 * eliminando barras de desplazamiento internas y garantizando un tamaño cómodo.
 */
export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  (
    {
      value,
      minHeight = 54,
      className = '',
      onChange,
      rows = 2,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastWidthRef = useRef<number>(0);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Restablecer altura temporalmente para recalcular scrollHeight con precisión
      textarea.style.height = 'auto';

      // Calcular altura respetando la altura mínima cómoda
      const nextHeight = Math.max(textarea.scrollHeight, minHeight);
      textarea.style.height = `${nextHeight}px`;
    };

    // Auto-redimensionar al cambiar el valor (escritura, pegado o IA)
    useEffect(() => {
      adjustHeight();
    }, [value, minHeight]);

    // Auto-redimensionar ante cambios de ancho o redimensionamiento de ventana
    useEffect(() => {
      const handleResize = () => adjustHeight();
      window.addEventListener('resize', handleResize);

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined' && textareaRef.current) {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const currentWidth = entry.contentRect.width;
            if (currentWidth > 0 && currentWidth !== lastWidthRef.current) {
              lastWidthRef.current = currentWidth;
              adjustHeight();
            }
          }
        });
        resizeObserver.observe(textareaRef.current);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        rows={rows}
        className={`w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-xs sm:text-sm resize-none overflow-hidden transition-[height] duration-75 ease-out leading-relaxed ${className}`}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
