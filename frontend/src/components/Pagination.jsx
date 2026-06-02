const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handlePageChange = (page) => {
    if (page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  const baseButton = 'px-3 py-2 rounded-full text-sm font-bold border transition-all duration-200';
  const activeButton = 'bg-primary dark:bg-secondary text-white dark:text-surface border-primary dark:border-secondary shadow-sm';
  const inactiveButton = 'bg-white dark:bg-gray-800 text-gray-700 dark:text-on-surface border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500';
  const navButton =
    'bg-white dark:bg-gray-800 text-gray-700 dark:text-on-surface border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed';

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

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={`${baseButton} ${page === currentPage ? activeButton : inactiveButton}`}
          onClick={() => handlePageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className={`${baseButton} ${navButton}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Proxima
      </button>
    </nav>
  );
};

export default Pagination;
