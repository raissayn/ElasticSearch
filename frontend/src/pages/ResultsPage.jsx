import React, { useContext } from 'react';
import TopNavBar from '../components/TopNavBar';
import SideNavBar from '../components/SideNavBar';
import Footer from '../components/Footer';
import ResultCard from '../components/ResultCard';
import { SearchContext } from '../contexts/SearchContext';

const ResultsPage = () => {
  const { query, setQuery } = useContext(SearchContext);

  return (
    <div className="min-h-screen results-bg flex flex-col">
      <TopNavBar isHome={false} />
      <SideNavBar />
      
      <main className="ml-64 pt-24 pb-32 px-12 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto flex-grow w-full">
        <div className="col-span-12 mb-8">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-gray-400">search</span>
            </div>
            <input 
              className="w-full bg-gray-800/60 backdrop-blur-2xl border-none ring-1 ring-gray-700 rounded-full py-5 pl-16 pr-8 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary/40 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)]" 
              placeholder="Search BCC001, Syllabuses, Regulations..." 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="absolute inset-y-2 right-2 px-8 bg-primary hover:bg-primary-dim text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-2">
              Update Results
            </button>
          </div>
          <div className="flex justify-center mt-4 gap-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Popular:</span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline cursor-pointer">BCC012</span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline cursor-pointer">Algorithm Design</span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline cursor-pointer">2024.1 Regulations</span>
          </div>
        </div>

        <section className="col-span-12 space-y-6 lg:col-span-10 lg:col-start-2">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 px-2 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full"></span>
            Resultados para "{query || 'tudo'}"
          </h2>

          {/* Hardcoded mock results for now */}
          <ResultCard 
            tag="BCC001"
            period="1st Period"
            course="Computer Science"
            title="Introduction to Computational Logic"
            description="Complete syllabus covering propositional logic, predicate calculus, and formal proof methods. Essential for foundational understanding of computer architecture and discrete mathematics. Updated for the 2024 academic year..."
          />
          <ResultCard 
            tag="BCC002"
            period="1st Period"
            course="Computer Science"
            title="Programming Fundamentals I"
            description="Document detailing lab schedules, evaluation criteria, and core programming paradigms using C/C++. Includes the updated 2024 project repository links and institutional guidelines for laboratory use."
          />
        </section>
      </main>

      <div className="ml-64 z-50">
        <Footer />
      </div>
    </div>
  );
};

export default ResultsPage;
