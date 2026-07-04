import { useContext, useState, useRef, useEffect } from 'react';
import { SearchContext } from '../contexts/SearchContext';
import ResultCard from '../components/ResultCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import ThemeToggle from '../components/ThemeToggle';
import logoUnifal from '../assets/logoUnifal.png';
import {
  Search,
  X,
  ChevronDown,
  Layers,
  GraduationCap,
  Scale,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Telescope,
  SearchX,
} from 'lucide-react';

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
  const [suggestedQuery, setSuggestedQuery] = useState(null);
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

  // "/" keyboard shortcut to focus the search input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
      setSuggestedQuery(null);
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
        include_suggestions: "true",
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
      setSuggestedQuery(data.suggested_query || null);
    } catch (err) {
      setError(err.message);
      setResults([]);
      setTotal(0);
      setSuggestedQuery(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setSuggestedQuery(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => searchInputRef.current?.focus(), 400);
  };

  const handleSuggestionClick = async () => {
    if (suggestedQuery) {
      setQuery(suggestedQuery);
      setSuggestedQuery(null);
      await performSearch(suggestedQuery, sortBy, category, 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-surface font-sans text-gray-900 dark:text-on-surface transition-colors duration-300">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-primary dark:text-secondary">UniSearch.</div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <img src={logoUnifal} alt="Logo UNIFAL" className="h-8 md:h-10 w-auto object-contain hover:scale-105 transition-transform duration-200 dark:brightness-110" />
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 pb-20">
        
        {/* Hero Section */}
        <div className="bg-unifal-bg dark:bg-surface-variant rounded-3xl md:rounded-[2rem] p-6 md:p-16 mb-8 relative flex flex-col justify-between min-h-[360px] md:min-h-[420px] transition-colors duration-300">
          
          {/* Background Decorative Layer (Clipped to rounded corners) */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl md:rounded-[2rem] pointer-events-none">
            {/* Decorative Blobs */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 dark:opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 70% 30%, #0fafee 0%, transparent 60%)'
            }}></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-full opacity-10 dark:opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 30% 70%, #07378d 0%, transparent 60%)'
            }}></div>
          </div>

          <div className="relative z-10 max-w-3xl mt-2 md:mt-4">
            <h1 className="text-4xl md:text-6xl lg:text-[72px] font-bold text-primary dark:text-secondary tracking-tight mb-4 md:mb-6 leading-none">
              E aí, estudante! <span role="img" aria-label="aceno" className="emoji">👋</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-700 dark:text-on-surface-variant font-medium max-w-2xl">
              O que você vai descobrir hoje? Faça buscas inteligentes e encontre qualquer material em nossa base de dados
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative z-10 w-full mt-10 md:mt-16 bg-white dark:bg-gray-800 rounded-3xl md:rounded-full p-3 md:p-2 flex flex-col md:flex-row items-center shadow-lg gap-2 md:gap-0 transition-colors duration-300">
            {/* Input Field - takes more space */}
            <div className="flex-[2] flex items-center px-2 md:px-4 py-2 w-full">
              <Search size={24} className="text-gray-400 dark:text-gray-500 mr-2 md:mr-3" aria-hidden="true" />
              <input 
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por 'Cálculo I' ou 'BCC001'"
                className="w-full outline-none text-gray-800 dark:text-on-surface placeholder-gray-400 dark:placeholder-gray-500 font-medium bg-transparent text-base md:text-lg"
              />
              {query && (
                <button type="button" onClick={handleClear} aria-label="Limpar busca" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 flex items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-90">
                  <X size={14} aria-hidden="true" />
                </button>
              )}
            </div>
            
            <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            
            {/* Custom Dropdown - takes less space and sits closer */}
            <div 
              className="relative min-w-[200px] w-full md:w-auto px-2 md:px-4 py-3 md:py-2 border-t border-gray-100 dark:border-gray-700 md:border-none cursor-pointer" 
              ref={dropdownRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-800 dark:text-on-surface font-medium text-base md:text-lg truncate pr-4">
                  {category}
                </span>
                <ChevronDown size={24} className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </div>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 md:left-auto md:-right-4 mt-4 w-full md:w-56 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl py-2 z-50 overflow-hidden animate-fade-in-down">
                  {categories.map((cat) => (
                    <div 
                      key={cat}
                      className={`px-5 py-3 hover:bg-unifal-bg dark:hover:bg-gray-700 transition-colors text-base font-medium ${category === cat ? 'text-primary dark:text-secondary bg-unifal-bg dark:bg-gray-700' : 'text-gray-600 dark:text-gray-400'}`}
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
              className="mt-2 md:mt-0 w-full md:w-auto px-8 py-3.5 bg-primary dark:bg-secondary text-white dark:text-surface rounded-2xl md:rounded-full font-bold hover:bg-primary-dim dark:hover:bg-secondary-dim transition-colors shrink-0"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Dynamic Content: Cards OR Results */}
        {!hasSearched ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto mt-12 animate-fade-in-up">
              <div 
                onClick={() => {
                  setCategory("Disciplinas");
                  searchInputRef.current?.focus();
                }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 hover:border-secondary transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg dark:bg-gray-700 rounded-full flex items-center justify-center">
                   <Layers size={24} className="text-primary dark:text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-on-surface">Disciplinas</h3>
                <p className="text-gray-600 dark:text-on-surface-variant text-base leading-relaxed">Acesse ementas, cargas horárias, pré-requisitos e planos de ensino com facilidade.</p>
              </div>
              <div 
                onClick={() => {
                  setCategory("Professores");
                  searchInputRef.current?.focus();
                }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 hover:border-secondary transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg dark:bg-gray-700 rounded-full flex items-center justify-center">
                   <GraduationCap size={24} className="text-primary dark:text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-on-surface">Corpo Docente</h3>
                <p className="text-gray-600 dark:text-on-surface-variant text-base leading-relaxed">Consulte os professores do curso, suas titulações e áreas de atuação.</p>
              </div>
              <div 
                onClick={() => {
                  setCategory("Regulamentos");
                  searchInputRef.current?.focus();
                }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 hover:border-secondary transition-all cursor-pointer"
              >
                <div className="mb-6 w-12 h-12 bg-unifal-bg dark:bg-gray-700 rounded-full flex items-center justify-center">
                   <Scale size={24} className="text-primary dark:text-secondary" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-on-surface">Regulamentos</h3>
                <p className="text-gray-600 dark:text-on-surface-variant text-base leading-relaxed">Encontre normas de TCC, resoluções de estágio e regimentos internos em um só lugar.</p>
              </div>
            </div>

            {/* Seção Sobre */}
            <section className="mt-32 max-w-5xl mx-auto space-y-24 px-4 md:px-6 animate-fade-in-up">
              {/* Cabeçalho da Seção */}
              <div className="text-center space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary dark:text-secondary">
                  Conheça o UniSearch
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg md:text-xl">
                  Uma plataforma feita de discentes para discentes.
                </p>
              </div>

              {/* Bloco 1: Como Surgiu */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-unifal-bg dark:bg-gray-700 text-primary dark:text-secondary rounded-xl shrink-0">
                      <Lightbulb size={20} strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-950 dark:text-on-surface">Como Surgiu</h3>
                  </div>
                  <p className="text-gray-600 dark:text-on-surface-variant leading-relaxed text-base">
                    Encontrar informações precisas dentro dos portais da universidade sempre foi um desafio para os estudantes. Horas gastas procurando por uma resolução de estágio específica, tentando descobrir o pré-requisito de uma disciplina ou buscando a área de atuação de um professor geravam frustração. O <strong>UniSearch</strong> surgiu justamente para resolver essa dor. Desenvolvida nesta primeira etapa para o curso de <strong>Ciência da Computação da UNIFAL-MG</strong>, a plataforma centraliza e simplifica o acesso à informação.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg dark:bg-surface-variant rounded-3xl overflow-hidden border border-blue-100 dark:border-gray-700 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-secondary opacity-20 dark:opacity-10 blur-xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary opacity-10 dark:opacity-5 blur-2xl"></div>
                    <div className="relative space-y-3 w-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                      <div className="h-4 w-1/3 bg-primary dark:bg-secondary rounded opacity-25"></div>
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-4/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="pt-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-primary dark:text-secondary font-bold">UNIFAL-MG</span>
                        <CheckCircle2 size={18} className="text-secondary" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 2: O que Faz */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-unifal-bg dark:bg-gray-700 text-primary dark:text-secondary rounded-xl shrink-0">
                      <Search size={20} strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-950 dark:text-on-surface">O que a Plataforma Faz</h3>
                  </div>
                  <p className="text-gray-600 dark:text-on-surface-variant leading-relaxed text-base">
                    Nós indexamos e processamos documentos universitários complexos (como PDFs de regulamentos, planos pedagógicos de disciplinas e regimentos internos) e os tornamos instantaneamente buscáveis por relevância. Em segundos, você encontra o que precisa sem precisar ler dezenas de páginas.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg dark:bg-surface-variant rounded-3xl overflow-hidden border border-blue-100 dark:border-gray-700 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-primary opacity-20 dark:opacity-10 blur-xl"></div>
                    <div className="relative w-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transform rotate-2 hover:rotate-0 transition-transform duration-300 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 bg-unifal-bg dark:bg-gray-700 text-primary dark:text-secondary rounded-full flex items-center justify-center">
                        <Telescope size={30} className="text-primary dark:text-secondary" aria-hidden="true" />
                      </div>
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                      <div className="text-xs font-semibold text-secondary">Busca Semântica Rápida</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco 3: Diferencial */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-unifal-bg dark:bg-gray-700 text-primary dark:text-secondary rounded-xl shrink-0">
                      <Sparkles size={20} strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-950 dark:text-on-surface">Nosso Diferencial</h3>
                  </div>
                  <p className="text-gray-600 dark:text-on-surface-variant leading-relaxed text-base">
                    Diferente de uma busca comum, o UniSearch utiliza <strong>busca inteligente baseada em Elasticsearch</strong>, oferecendo filtros específicos para <em>Disciplinas</em>, <em>Regulamentos</em> e <em>Corpo Docente</em> em uma interface moderna, rápida e totalmente adaptada para computadores e celulares.
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                  <div className="relative w-full max-w-sm aspect-[4/3] bg-unifal-bg dark:bg-surface-variant rounded-3xl overflow-hidden border border-blue-100 dark:border-gray-700 flex items-center justify-center p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="absolute -top-8 right-0 w-24 h-24 rounded-full bg-secondary opacity-25 dark:opacity-10 blur-2xl"></div>
                    <div className="relative w-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transform -rotate-1 hover:rotate-0 transition-transform duration-300 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Velocidade de Resposta</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">0.03s</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-xs bg-unifal-bg dark:bg-gray-700 text-primary dark:text-secondary px-2.5 py-1 rounded-full font-semibold">Elasticsearch v8</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full font-semibold">Busca Semântica</span>
                        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-secondary px-2.5 py-1 rounded-full font-semibold">Filtros Avançados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA final */}
              <div className="text-center pt-8">
                <div className="inline-block p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm max-w-2xl">
                  <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-on-surface mb-5">
                    <span role="img" aria-label="foguete">🚀</span> Pronto para facilitar sua rotina acadêmica?
                  </p>
                  <button 
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setTimeout(() => searchInputRef.current?.focus(), 500);
                    }}
                    className="px-8 py-3.5 bg-primary dark:bg-secondary text-white dark:text-surface font-bold rounded-full hover:bg-primary-dim dark:hover:bg-secondary-dim transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
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
              {/* Sugestão de Busca ("Você quis dizer?") */}
              {suggestedQuery && !isLoading && (
                <div className="mb-6 p-4 md:p-5 bg-blue-50/60 dark:bg-sky-950/20 border border-blue-100/80 dark:border-sky-900/30 rounded-3xl flex items-center gap-3.5 shadow-sm animate-fade-in-down">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100/50 dark:bg-sky-900/40 text-primary dark:text-secondary shrink-0">
                    <Sparkles size={18} className="select-none" aria-hidden="true" />
                  </div>
                  <p className="text-sm md:text-base text-gray-700 dark:text-sky-200 font-medium">
                    Você quis dizer:{" "}
                    <button
                      onClick={handleSuggestionClick}
                      className="font-bold text-primary dark:text-secondary hover:underline underline-offset-4 focus:outline-none transition-all duration-200 hover:scale-[1.01] inline-block text-left"
                    >
                      {suggestedQuery}
                    </button>
                    ?
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-on-surface-variant">
                  {isLoading ? "Buscando..." : (
                    <><span className="font-bold text-gray-900 dark:text-on-surface">{total}</span> resultados encontrados</>
                  )}
                </p>
                <div className="relative hidden md:block">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full py-2.5 pl-5 pr-12 text-sm font-bold text-gray-900 dark:text-on-surface outline-none focus:border-gray-500 cursor-pointer transition-colors duration-300"
                  >
                    <option value="relevance">Relevância</option>
                    <option value="recent">Mais recentes</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-2.5 text-gray-500 pointer-events-none" aria-hidden="true" />
                </div>
              </div>

              {error && <p className="text-red-500 mb-4">{error}</p>}

              <div className="space-y-5">
                {isLoading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : results.length > 0 ? (
                  <div className="space-y-5 animate-fade-in-up">
                    {results.map((item, index) => (
                      <ResultCard 
                        key={item.document_id || [item.source_id || item.url_documento, item.pagina || index].join('-')}
                        {...item}
                        max_score={maxScore}
                      />
                    ))}
                  </div>
                ) : (
                  !error && (
                    <div className="flex flex-col items-center justify-center text-center py-12 animate-fade-in-up">
                      <div className="w-16 h-16 bg-unifal-bg dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <SearchX size={32} className="text-gray-400 dark:text-gray-500" aria-hidden="true" />
                      </div>
                      <p className="text-gray-700 dark:text-on-surface font-bold text-lg mb-1">Nenhum resultado encontrado</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">Tente outra categoria, verifique a ortografia ou use termos mais genéricos.</p>
                    </div>
                  )
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
