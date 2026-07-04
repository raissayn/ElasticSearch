import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Bookmark } from 'lucide-react';
import { useSavedItems } from '../contexts/SavedItemsContext';
import { getSavedKey } from '../utils/savedItems';
import ResultCard from './ResultCard';

const SavedPanel = ({ onClose }) => {
  const { savedItems } = useSavedItems();
  const [isClosing, setIsClosing] = useState(false);
  const closingRef = useRef(false);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setIsClosing(true);
    window.setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Itens salvos">
      {/* Overlay com blur sutil */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleClose}
      />

      {/* Painel lateral direito */}
      <aside
        className={`relative h-full w-full sm:w-[42%] max-w-md bg-white dark:bg-surface rounded-l-3xl shadow-2xl flex flex-col ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bookmark
              size={22}
              className="text-primary dark:text-secondary"
              fill="currentColor"
              aria-hidden="true"
            />
            <h2 className="text-lg font-bold text-gray-900 dark:text-on-surface">
              Itens Salvos
            </h2>
            {savedItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-unifal-bg dark:bg-gray-700 text-primary dark:text-secondary text-xs font-bold">
                {savedItems.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Lista de itens salvos */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 animate-fade-in-up">
              <div className="w-16 h-16 bg-unifal-bg dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Bookmark size={32} className="text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </div>
              <p className="text-gray-700 dark:text-on-surface font-bold text-base mb-1">
                Nenhum item salvo ainda
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                Toque no ícone de favorito em qualquer resultado para salvá-lo aqui e acessar depois.
              </p>
            </div>
          ) : (
            savedItems.map((item) => (
              <ResultCard
                key={getSavedKey(item)}
                {...item}
                max_score={item.max_score || item.score || 0}
              />
            ))
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default SavedPanel;
