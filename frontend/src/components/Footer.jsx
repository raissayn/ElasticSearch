import React from 'react';

const Footer = () => (
  <footer className="w-full mt-auto bg-gray-900/50 backdrop-blur-lg border-t border-gray-700/30 flex flex-col md:flex-row justify-between items-center px-12 py-8 gap-4 text-xs leading-relaxed z-40 relative">
    <div className="flex flex-col gap-1">
      <span className="font-bold text-gray-300 text-sm">Unifal-MG Digital Archive</span>
      <p className="text-gray-400">© 2024 Unifal-MG Digital Archive. Innovation through Transparency.</p>
    </div>
    <div className="flex gap-8">
      <a className="text-gray-400 hover:text-primary transition-colors" href="#">Institutional Privacy</a>
      <a className="text-gray-400 hover:text-primary transition-colors" href="#">Archive Protocol</a>
      <a className="text-gray-400 hover:text-primary transition-colors" href="#">Contact Curator</a>
    </div>
  </footer>
);

export default Footer;
