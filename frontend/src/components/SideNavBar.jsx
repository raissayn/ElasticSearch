import React from 'react';
import { Link } from 'react-router-dom';

const SideNavBar = () => (
  <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-950/30 backdrop-blur-md border-r border-gray-800/10 flex flex-col py-6 pr-4 space-y-2 text-sm font-medium uppercase tracking-[0.1em] z-40">
    <Link className="flex items-center gap-4 px-6 py-3 text-gray-400 hover:bg-white/5 hover:translate-x-1 transition-transform duration-300 rounded-lg" to="#">
      <span className="material-symbols-outlined">history</span>
      <span>Search History</span>
    </Link>
    <Link className="flex items-center gap-4 px-6 py-3 text-gray-400 hover:bg-white/5 hover:translate-x-1 transition-transform duration-300 rounded-lg" to="#">
      <span className="material-symbols-outlined">description</span>
      <span>Saved Documents</span>
    </Link>

    <div className="mt-8 px-6">
      <p className="text-[10px] font-bold text-gray-500 mb-4 px-2">Refine Search</p>
      <div className="space-y-4">
        <div className="group cursor-pointer">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/20 text-gray-300">
            <span className="text-[11px]">Academic Year</span>
            <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
          </div>
        </div>
        <div className="group cursor-pointer">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/20 text-gray-300">
            <span className="text-[11px]">Document Type</span>
            <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-auto border-t border-white/10 pt-4">
      <Link className="flex items-center gap-4 px-6 py-3 text-gray-400 hover:bg-white/5 hover:translate-x-1 transition-transform duration-300 rounded-lg" to="#">
        <span className="material-symbols-outlined">help</span>
        <span>Support</span>
      </Link>
    </div>
  </aside>
);

export default SideNavBar;
