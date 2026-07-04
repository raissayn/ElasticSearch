const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) {
      return;
    }
    onPageChange(page);
  };

  const baseButton = 'px-3 py-2 rounded-full text-sm font-bold border transition-all duration-200';
  const activeButton = 'bg-primary dark:bg-secondary text-white dark:text-surface border-primary dark:border-secondary shadow-sm';
  const inactiveButton = 'bg-white dark:bg-gray-800 text-gray-700 dark:text-on-surface border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500';
  const navButton =
    'bg-white dark:bg-gray-800 text-gray-700 dark:text-on-surface border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed';

  // Build page list with ellipsis: always show first, last, and neighbors of current page
  const buildPages = () => {
    const pages = [];
    const add = (p) => pages.push(p);
    const delta = 1; // neighbors on each side of current

    for (let i = 1; i <= totalPages; i++) {
      const isFirst = i === 1;
      const isLast = i === totalPages;
      const isWithinDelta = Math.abs(i - currentPage) <= delta;

      if (isFirst || isLast || isWithinDelta) {
        add(i);
      } else {
        const prev = pages[pages.length - 1];
        if (prev !== '...') {
          add('...');
        }
      }
    }
    return pages;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        className={`${baseButton} ${navButton}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Anterior
      </button>

      {buildPages().map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-gray-400 font-bold select-none">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={`${baseButton} ${page === currentPage ? activeButton : inactiveButton}`}
            onClick={() => handlePageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        className={`${baseButton} ${navButton}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Próxima
      </button>
    </nav>
  );
};

export default Pagination;
