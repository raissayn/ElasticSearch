import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Bookmark } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import SavedPanel from '../components/SavedPanel';
import { useSavedItems } from '../contexts/SavedItemsContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { savedItems } = useSavedItems();
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-surface font-sans text-gray-900 dark:text-on-surface transition-colors duration-300">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-primary dark:text-secondary">UniSearch.</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsSavedPanelOpen(true)}
            aria-label="Ver itens salvos"
            className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center text-primary dark:text-secondary focus:outline-none active:scale-90 hover:scale-110"
          >
            <Bookmark size={24} aria-hidden="true" />
            {savedItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-primary dark:bg-secondary text-white dark:text-surface text-[10px] font-bold leading-none ring-2 ring-white dark:ring-surface">
                {savedItems.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Hero 404 */}
      <main className="max-w-2xl mx-auto px-4 md:px-6 pb-20">
        <div className="bg-unifal-bg dark:bg-surface-variant rounded-3xl md:rounded-[2rem] p-8 md:p-16 flex flex-col items-center text-center relative overflow-hidden animate-fade-in-up">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 dark:opacity-10 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 70% 30%, #0fafee 0%, transparent 60%)'
          }}></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-full opacity-10 dark:opacity-5 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 30% 70%, #07378d 0%, transparent 60%)'
          }}></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-6 w-20 h-20 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md">
              <Compass size={40} className="text-primary dark:text-secondary" aria-hidden="true" />
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-primary dark:text-secondary tracking-tight mb-3 leading-none">
              404
            </h1>
            <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-on-surface mb-2">
              Oops! Esta página pegou férias acadêmicas. 🏖️
            </p>
            <p className="text-gray-600 dark:text-on-surface-variant font-medium max-w-md mb-8">
              Não encontramos o que você procurava, mas o buscador está a um clique de te ajudar a achar o caminho certo.
            </p>

            <button
              onClick={() => navigate('/')}
              className="px-8 py-3.5 bg-primary dark:bg-secondary text-white dark:text-surface font-bold rounded-full hover:bg-primary-dim dark:hover:bg-secondary-dim transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
            >
              Voltar ao buscador
            </button>
          </div>
        </div>
      </main>

      {isSavedPanelOpen && <SavedPanel onClose={() => setIsSavedPanelOpen(false)} />}
    </div>
  );
};

export default NotFoundPage;
