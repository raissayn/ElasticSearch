import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center text-primary dark:text-secondary focus:outline-none active:scale-90 hover:scale-110"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon size={24} aria-hidden="true" /> : <Sun size={24} aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
