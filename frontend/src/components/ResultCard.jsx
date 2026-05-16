const ResultCard = ({ tag, period, course, title, description, time }) => (
  <article className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 hover:border-secondary hover:shadow-md transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-unifal-bg rounded-full flex shrink-0 items-center justify-center text-primary">
          <span className="material-symbols-outlined">school</span>
        </div>
        <span className="font-bold text-gray-900 line-clamp-2 leading-tight">{course}</span>
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <span className="text-xs md:text-sm font-medium text-gray-500">{time}</span>
        <button type="button" className="text-gray-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined font-light">bookmark</span>
        </button>
      </div>
    </div>
    
    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm line-clamp-2 mb-6">{description}</p>
    
    <div className="flex flex-wrap items-center gap-y-2 gap-x-3 md:gap-4 text-xs md:text-sm font-medium text-gray-600">
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] md:text-[18px]">schedule</span> {period}
      </div>
      <div className="hidden md:block w-px h-4 bg-gray-300"></div>
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] md:text-[18px]">public</span> Presencial
      </div>
      <div className="hidden md:block w-px h-4 bg-gray-300"></div>
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px] md:text-[18px]">group</span> 40 Alunos
      </div>
      <div className="hidden md:block w-px h-4 bg-gray-300"></div>
      <div className="flex items-center gap-1.5 font-bold text-gray-800">
        <span className="material-symbols-outlined text-[16px] md:text-[18px] text-gray-400">sell</span> {tag}
      </div>
    </div>
  </article>
);

export default ResultCard;
