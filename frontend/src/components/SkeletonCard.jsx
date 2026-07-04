const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 md:p-6">
      {/* Header: icon + context + relevance */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 skeleton rounded-full shrink-0"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 skeleton rounded"></div>
            <div className="h-3 w-20 skeleton rounded"></div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end gap-1">
            <div className="h-3 w-10 skeleton rounded"></div>
            <div className="w-16 h-1.5 skeleton rounded-full"></div>
          </div>
          <div className="w-5 h-5 skeleton rounded"></div>
        </div>
      </div>

      {/* Title */}
      <div className="h-6 w-3/4 skeleton rounded mb-2"></div>

      {/* Body lines */}
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full skeleton rounded"></div>
        <div className="h-3 w-5/6 skeleton rounded"></div>
        <div className="h-3 w-2/3 skeleton rounded"></div>
      </div>

      {/* Footer metadata bar */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="h-3 w-24 skeleton rounded"></div>
        <div className="h-3 w-20 skeleton rounded"></div>
        <div className="ml-auto h-3 w-28 skeleton rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
