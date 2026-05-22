/**
 * Pagination component — clean, professional page controls.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, total, onPageChange }) {
  if (pages <= 1 && total <= 0) return null;

  const getPageNumbers = () => {
    const nums = [];
    const maxShow = 5;
    let start = Math.max(1, page - Math.floor(maxShow / 2));
    let end   = Math.min(pages, start + maxShow - 1);
    if (end - start + 1 < maxShow) start = Math.max(1, end - maxShow + 1);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  };

  return (
    <div className="flex items-center justify-between py-0.5">
      <p className="text-[12px] text-gray-400 dark:text-gray-500">
        <span className="font-semibold text-gray-600 dark:text-gray-300">{total}</span> total records
        {pages > 1 && (
          <> &middot; page <span className="font-semibold text-gray-600 dark:text-gray-300">{page}</span> of {pages}</>
        )}
      </p>

      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((num) => (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`min-w-[32px] h-8 rounded-lg text-[13px] font-medium transition-all ${
                num === page
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
