import { useContext, useState, useRef, useEffect } from 'react';
import { SearchContext } from '../contexts/SearchContext';
import ResultCard from '../components/ResultCard';
import Pagination from '../components/Pagination';
import logoUnifal from '../assets/logoUnifal.png';

const PAGE_SIZE = 10;

const HomePage = () => {
  const { query, setQuery } = useContext(SearchContext);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  
  const [category, setCategory] = useState("Tudo");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const categories = ["Tudo", "Disciplinas", "Regulamentos", "Professores"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (
    searchQuery,
    searchSort,
    searchCategory = category,
    searchPage = 1
  ) => {
    if (!searchQuery.trim() && searchCategory === "Tudo") {
      setHasSearched(false);
      setResults([]);
      setTotal(0);
      setMaxScore(0);
      setCurrentPage(1);
      return;
    }

    setHasSearched(true);
    setIsLoading(true);
    setError(null);
    setCurrentPage(searchPage);

    try {
      const categoryMap = {
        "Tudo": "",
        "Disciplinas": "disciplina",
        "Regulamentos": "secao_texto",
        "Professores": "pessoa"
      };
      const tipo = categoryMap[searchCategory] || "";

      const params = new URLSearchParams({
        query: searchQuery,
        page: String(searchPage),
        sort_by: searchSort,
      });
      if (tipo) {
        params.append("tipo", tipo);
      }

      const response = await fetch(`http://localhost:8000/v1/search?${params}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar resultados');
      }
      const data = await response.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
      setMaxScore(data.max_score || 0);
    } catch (err) {
      setError(err.message);
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await performSearch(query, sortBy, category, 1);
  };

  const handleSortChange = async (newSort) => {
    setSortBy(newSort);
    if (hasSearched) {
      await performSearch(query, newSort, category, 1);
    }
  };

  const handlePageChange = async (page) => {
    if (page === currentPage) {
      return;
    }
    await performSearch(query, sortBy, category, page);
  };

  const handleClear = () => {
    setQuery('');
    setCategory('Tudo');
    setSortBy('relevance');
    setHasSearched(false);
    setResults([]);
    setTotal(0);
    setMaxScore(0);
    setCurrentPage(1);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-primary">UniSearch.</div>
        <div className="flex items-center">
          <img src={logoUnifal} alt="Logo UNIFAL" className="h-8 md:h-10 w-auto object-contain hover:scale-105 transition-transform duration-200" />
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 pb-20">
        
        {/* Hero Section */}
        <div className="bg-unifal-bg rounded-3xl md:rounded-[2rem] p-6 md:p-16 mb-8 relative flex flex-col justify-between min-h-[360px] md:min-h-[420px]">
          
          {/* Background Decorative Layer (Clipped to rounded corners) */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl md:rounded-[2rem] pointer-events-none">
            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 70% 30%, #0fafee 0%, transparent 60%)'
            }}></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-full opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 30% 70%, #07378d 0%, transparent 60%)'
            }}></div>
          </div>

          <div className="relative z-10 max-w-3xl mt-2 md:mt-4">
            <h1 className="text-4xl md:text-6xl lg:text-[72px] font-bold text-primary tracking-tight mb-4 md:mb-6 leading-none">
              E aí, estudante! 👋
            </h1>
            <p className="text-lg md:text-2xl text-gray-700 font-medium max-w-2xl">
              O que você vai descobrir hoje? Faça buscas inteligentes e encontre qualquer material em nossa base de dados
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative z-10 w-full mt-10 md:mt-16 bg-white rounded-3xl md:rounded-full p-3 md:p-2 flex flex-col md:flex-row items-center shadow-lg gap-2 md:gap-0">
            {/* Input Field - takes more space */}
            <div className="flex-[2] flex items-center px-2 md:px-4 py-2 w-full">
              <span className="material-symbols-outlined text-gray-400 mr-2 md:mr-3 text-xl md:text-2xl">search</span>
              <input 
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por 'Cálculo I' ou 'BCC001'"
                className="w-full outline-none text-gray-800 placeholder-gray-400 font-medium bg-transparent text-base md:text-lg"
              />
              {query && (
                <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600 px-2 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
            
            <div className="hidden md:block w-px h-8 bg-gray-200 mx-1"></div>
            
            {/* Custom Dropdown - takes less space and sits closer */}
            <div 
              className="relative min-w-[200px] w-full md:w-auto px-2 md:px-4 py-3 md:py-2 border-t border-gray-100 md:border-none cursor-pointer" 
              ref={dropdownRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium text-base md:text-lg truncate pr-4">
                  {category}
                </span>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </div>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 md:left-auto md:-right-4 mt-4 w-full md:w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {categories.map((cat) => (
                    <div 
                      key={cat}
                      className={`px-5 py-3 hover:bg-unifal-bg transition-colors text-base font-medium ${category === cat ? 'text-primary bg-unifal-bg' : 'text-gray-600'}`}
                      onClick={() => {
                        setCategory(cat);
                        setIsDropdownOpen(false);
                        if (hasSearched || query.trim()) {
                          performSearch(query, sortBy, cat, 1);
                        }
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="mt-2 md:mt-0 w-full md:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl md:rounded-full font-bold hover:bg-primary-dim transition-colors shrink-0"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Dynamic Content: Cards OR Results */}
        {!hasSearched ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-12">
              <div 
                onClick={() => {
                  setCategory("Disciplinas");
                  searchInputRef.current?.focus();
                }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-2xl">layers</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Disciplinas</h3>
                <p className="text-gray-600 text-base leading-relaxed">Acesse ementas, cargas horárias, pré-requisitos e planos de ensino com facilidade.</p>
              </div>
              <div 
                onClick={() => {
                  setCategory("Professores");
                  searchInputRef.current?.focus();
                }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-2xl">school</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Corpo Docente</h3>
                <p className="text-gray-600 text-base leading-relaxed">Consulte os professores do curso, suas titulações e áreas de atuação.</p>
              </div>
              <div 
                onClick={() => {
                  setCategory("Regulamentos");
                  searchInputRef.current?.focus();
                }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 hover:border-secondary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg rounded-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">Regulamentos</h3>
                <p className="text-gray-600 text-base leading-relaxed">Encontre normas de TCC, resoluções de estágio e regimentos internos em um só lugar.</p>
              </div>
            </div>

            {/* Seção Sobre */}
            <section className="mt-32 max-w-5xl mx-auto space-y-24 px-4 md:px-6">
              {/* Cabeçalho da Seção */}
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                  Conheça o UniSearch
                </h2>
                <p className="text-gray-500 font-medium text-lg md:text-xl">
                  Uma plataforma feita de discentes para discentes.
                </p>
              </div>

              {/* Bloco 1: Como Surgiu */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-unifal-bg text-primary rounded-2xl">
                    <span className="material-symbols-outlined text-2xl font-bold">lightbulb</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-950">Como Surgiu 💡</h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Encontrar informações precisas dentro dos portais da universidade sempre foi um desafio para os estudantes. Horas gastas procurando por uma resolução de estágio específica, tentando descobrir o pré-requisito de uma disciplina ou buscando a área de atuação de um professor geravam frustração. O <strong>UniSearch</strong> surgiu justamente para resolver essa dor. Desenvolvida nesta primeira etapa para o curso de <strong>Ciência da Computação da UNIFAL-MG</strong>, a plataforma centraliza e simplifica o acesso à informação.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg rounded-3xl overflow-hidden border border-blue-100 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-secondary opacity-20 blur-xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary opacity-10 blur-2xl"></div>
                    <div className="relative space-y-3 w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="h-4 w-1/3 bg-primary rounded opacity-25"></div>
                      <div className="h-3 w-full bg-gray-200 rounded"></div>
                      <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                      <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
                      <div className="pt-2 flex justify-between items-center border-t border-gray-100">
                        <span className="text-xs text-primary font-bold">UNIFAL-MG</span>
                        <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 2: O que Faz */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-unifal-bg text-primary rounded-2xl">
                    <span className="material-symbols-outlined text-2xl font-bold">search</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-950">O que a Plataforma Faz 🔍</h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Nós indexamos e processamos documentos universitários complexos (como PDFs de regulamentos, planos pedagógicos de disciplinas e regimentos internos) e os tornamos instantaneamente buscáveis por relevância. Em segundos, você encontra o que precisa sem precisar ler dezenas de páginas.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg rounded-3xl overflow-hidden border border-blue-100 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-primary opacity-20 blur-xl"></div>
                    <div className="relative w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transform rotate-2 hover:rotate-0 transition-transform duration-300 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 bg-unifal-bg text-primary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-3xl">search_insights</span>
                      </div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                      <div className="text-xs font-semibold text-secondary">Busca Semântica Rápida</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Diferencial */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-unifal-bg text-primary rounded-2xl">
                    <span className="material-symbols-outlined text-2xl font-bold">auto_awesome</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-950">Nosso Diferencial ✨</h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    Diferente de uma busca comum, o UniSearch utiliza <strong>busca inteligente baseada em Elasticsearch</strong>, oferecendo filtros específicos para <em>Disciplinas</em>, <em>Regulamentos</em> e <em>Corpo Docente</em> em uma interface moderna, rápida e totalmente adaptada para computadores e celulares.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg rounded-3xl overflow-hidden border border-blue-100 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute -top-8 right-0 w-24 h-24 rounded-full bg-secondary opacity-25 blur-2xl"></div>
                    <div className="relative w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transform -rotate-1 hover:rotate-0 transition-transform duration-300 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="text-xs font-bold text-gray-700">Velocidade de Resposta</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">0.03s</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-xs bg-unifal-bg text-primary px-2.5 py-1 rounded-full font-semibold">Elasticsearch v8</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">Busca Semântica</span>
                        <span className="text-xs bg-blue-50 text-secondary px-2.5 py-1 rounded-full font-semibold">Filtros Avançados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA final */}
              <div className="text-center pt-8">
                <div className="inline-block p-8 bg-white border border-gray-200 rounded-3xl shadow-sm max-w-2xl">
                  <p className="text-lg md:text-xl font-medium text-gray-800 mb-5">
                    🚀 Pronto para facilitar sua rotina acadêmica?
                  </p>
                  <button 
                    onClick={() => {
                      searchInputRef.current?.focus();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-primary-dim transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Ir para o buscador
                  </button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="flex justify-center mt-8 md:mt-12 w-full">
            {/* Results List */}
            <div className="w-full max-w-4xl">
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm font-medium text-gray-700">
                  {isLoading ? "Buscando..." : (
                    <><span className="font-bold text-gray-900">{total}</span> resultados encontrados</>
                  )}
                </p>
                <div className="relative hidden md:block">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-full py-2.5 pl-5 pr-12 text-sm font-bold text-gray-900 outline-none focus:border-gray-500 cursor-pointer"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="recent">Mais recentes</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-2.5 text-gray-500 pointer-events-none text-lg">expand_more</span>
                </div>
              </div>

              {error && <p className="text-red-500 mb-4">{error}</p>}

              <div className="space-y-5">
                {isLoading ? (
                  <p className="text-gray-500">Carregando...</p>
                ) : results.length > 0 ? (
                  results.map((item, index) => (
                    <ResultCard 
                      key={item.url_documento + index}
                      {...item}
                      max_score={maxScore}
                    />
                  ))
                ) : (
                  !error && <p className="text-gray-500">Nenhum resultado encontrado para a sua busca.</p>
                )}
              </div>

              {!isLoading && !error && results.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
