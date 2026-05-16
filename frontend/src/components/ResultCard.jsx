import React from 'react';

const ResultCard = ({ tag, period, course, title, description }) => (
  <article className="glass-card-r glass-border glow-shadow rounded-lg p-8 group hover:-translate-y-1 transition-all duration-400">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
          <span className="text-[10px] font-extrabold text-primary tracking-tighter">{tag}</span>
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{period}</span>
        <span className="text-xs font-bold text-primary-dim uppercase tracking-widest">{course}</span>
      </div>
      <button className="text-gray-500 hover:text-primary transition-colors">
        <span className="material-symbols-outlined">bookmark</span>
      </button>
    </div>
    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl">{description}</p>
    
    <div className="flex flex-wrap items-center gap-4">
      <button className="px-6 py-2.5 bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-full text-sm font-semibold text-white hover:bg-gray-700 transition-all flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">visibility</span> View PDF
      </button>
      <button className="px-6 py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-all flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">download</span> Download
      </button>
      <button className="ml-auto p-3 text-primary hover:bg-primary/20 rounded-full transition-all flex items-center gap-2 group/btn">
        <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">Add to Schedule</span>
        <span className="material-symbols-outlined">add_circle</span>
      </button>
    </div>
  </article>
);

export default ResultCard;
