import React from 'react';
import { ChevronLeft, ChevronRight, Sprout } from 'lucide-react';

const Pagination = ({ currentPage, totalCount, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container animate-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0', width: '100%' }}>
      <div className="cdp" actpage={currentPage}>
        <button
          className="cdp_i prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={20} style={{ marginRight: '4px' }} /> PREV
        </button>

        {startPage > 1 && (
          <>
            <button className="cdp_i" onClick={() => onPageChange(1)}>
              1
            </button>
            {startPage > 2 && <span className="cdp_ellipsis">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            className={`cdp_i ${page === currentPage ? 'cdp_active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page === currentPage && <Sprout size={14} style={{ marginRight: '4px' }} />}
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="cdp_ellipsis">...</span>}
            <button className="cdp_i" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </button>
          </>
        )}

        <button
          className="cdp_i next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          NEXT <ChevronRight size={20} style={{ marginLeft: '4px' }} />
        </button>
      </div>
      
      <div className="pagination-info" style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
        Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
      </div>
    </div>
  );
};

export default Pagination;
