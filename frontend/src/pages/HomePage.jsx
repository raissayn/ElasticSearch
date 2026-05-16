import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import { SearchContext } from '../contexts/SearchContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { query, setQuery } = useContext(SearchContext);

  const handleSearch = (e) => {
    e.preventDefault();
    if(query.trim()) {
      navigate('/results');
    }
  };

  return (
    <div className="min-h-screen bg-image-overlay flex flex-col">
      <TopNavBar isHome={true} />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">UniSearch</h1>
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">powered by Elasticsearch.</p>
        </div>

        <form onSubmit={handleSearch} className="glass-container rounded-full p-2 mb-20 w-full max-w-2xl flex items-center shadow-2xl">
          <div className="flex-grow flex items-center pl-6">
            <span className="material-symbols-outlined text-gray-400">search</span>
            <input 
              className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 px-4 py-3 text-lg outline-none" 
              placeholder="O que você procura? Ex: Ementa Cálculo I..." 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="h-8 border-l border-gray-500/50 mx-2"></div>
          <div className="px-4">
            <select className="bg-transparent border-none text-gray-300 focus:ring-0 outline-none appearance-none cursor-pointer text-sm font-medium rounded-lg">
              <option className="text-gray-900" value="all">Tudo</option>
              <option className="text-gray-900" value="ementas">Ementas</option>
              <option className="text-gray-900" value="horarios">Horários</option>
            </select>
          </div>
          <button type="submit" className="bg-primary hover:bg-primary-dim text-white p-3 rounded-full transition-colors duration-200 ml-2 shadow-lg">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card-h rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-blue-300 text-3xl">menu_book</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Ementas</h3>
              <p className="text-sm text-gray-300">Acesse facilmente os planos de ensino e bibliografias de todas as disciplinas.</p>
            </div>
            <div className="glass-card-h rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-purple-300 text-3xl">calendar_month</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Horários</h3>
              <p className="text-sm text-gray-300">Consulte os horários de aulas, laboratórios e atendimento dos professores.</p>
            </div>
            <div className="glass-card-h rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-green-300 text-3xl">gavel</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Regulamentos</h3>
              <p className="text-sm text-gray-300">Encontre resoluções, normas acadêmicas e portarias institucionais em um só lugar.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
