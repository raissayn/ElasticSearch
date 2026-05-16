import React from 'react';
import { Link } from 'react-router-dom';

const TopNavBar = ({ isHome }) => (
  <header className={`w-full py-6 px-8 flex justify-between items-center relative z-50 ${isHome ? '' : 'fixed top-0 bg-gray-900/40 backdrop-blur-xl border-b border-gray-700/20 h-16'}`}>
    <div className="flex items-center gap-3">
      <Link to="/" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb5vDUi4LkAW_kuv0FJZb6D8OmUVV0sA8jCAa2Hp-7NHMOiGU91gI5oA_A-PU0Ygf0DBSvrkppSdW-QHuKeSk0hiZs2lUeSC6xdenI09pQMGs-Zt_b8kdOmhghUQApyrRiTSdsI-yEofuFPk-OUG1hHrfPt2hBTo1LbRHx9r23jrIE66-E23y7BH6NWuqIsDqBvqsXeyiT0tzPII-Jw8THQvEAcmiV7cQSaJOgUPZEJv2DG1iLUnyAkgAQ6HcHHz2A1AmPRwv_0w" alt="UniSearch Logo" className="w-full h-full object-contain" />
      </Link>
    </div>
    <nav>
      <ul className="flex gap-8 text-sm font-medium text-gray-200">
        <li><Link className="hover:text-white transition-colors duration-200" to="/">Início</Link></li>
        <li><Link className="hover:text-white transition-colors duration-200" to="#">Sobre</Link></li>
      </ul>
    </nav>
  </header>
);

export default TopNavBar;
