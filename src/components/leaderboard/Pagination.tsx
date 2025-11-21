'use client';
import React, { useEffect, useState } from 'react';

import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Responsive: adjust maxPagesToShow based on screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const maxPagesToShow = isMobile ? 3 : 5;

  const pages = [];
  const startPage = Math.max(
    0,
    Math.min(
      currentPage - Math.floor(maxPagesToShow / 2),
      totalPages - maxPagesToShow
    )
  );
  const endPage = Math.min(totalPages, startPage + maxPagesToShow);

  // Always render "prev" button, but disable if on the first page
  pages.push(
    <button
      key='prev'
      onClick={() => {
        if (currentPage > 0) {
          onPageChange(currentPage - 1);
        }
      }}
      className={`${isMobile ? 'h-8 w-8 text-base' : 'h-11 w-11 text-lg'} flex items-center justify-center bg-white/5 rounded-[8px] ${currentPage === 0 ? 'text-white/30' : 'text-white hover:text-white'} `}
    >
      <ArrowLeftIcon />
    </button>
  );

  // ... existing code for ellipsis and first page button ...
  if (startPage > 0) {
    pages.push(
      <button
        key={0}
        onClick={() => onPageChange(0)}
        className={`${isMobile ? 'h-8 w-8 text-base' : 'h-11 w-11 text-lg'} flex items-center justify-center bg-white/5 rounded-[8px] text-peach-400 hover:text-white px-2 font-medium`}
      >
        1
      </button>
    );
    if (startPage > 1) {
      pages.push(
        <span key='start-ellipsis' className={`${isMobile ? 'px-1' : 'px-2'}`}>
          …
        </span>
      );
    }
  }

  for (let i = startPage; i < endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`bg-white/5 rounded-[8px] ${isMobile ? 'px-2 h-8 w-8 text-base' : 'px-3 h-11 w-11 text-lg'} font-medium flex items-center justify-center ${
          i === currentPage
            ? 'text-peach-400'
            : 'text-white/50 hover:text-white'
        }`}
      >
        {i + 1}
      </button>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(
        <span
          key='end-ellipsis'
          className={`${isMobile ? 'h-8 w-8 px-1 text-base' : 'h-11 w-11 px-3 text-lg'} font-medium flex justify-center items-end`}
        >
          …
        </span>
      );
    }
    pages.push(
      <button
        key={totalPages - 1}
        onClick={() => onPageChange(totalPages - 1)}
        className={`${isMobile ? 'h-8 w-8 text-base' : 'h-11 w-11 text-lg'} flex items-center justify-center bg-white/5 rounded-[8px] text-white hover:text-peach-400 px-2 font-medium`}
      >
        {totalPages}
      </button>
    );
  }

  // Always render "next" button, but disable if on the last page
  pages.push(
    <button
      key='next'
      onClick={() => {
        if (currentPage < totalPages - 1) {
          onPageChange(currentPage + 1);
        }
      }}
      className={`${isMobile ? 'h-8 w-8 text-base' : 'h-11 w-11 text-lg'} flex items-center justify-center bg-white/5 rounded-[8px] ${currentPage === totalPages - 1 ? 'text-white/30' : 'text-white hover:text-white'} `}
      disabled={currentPage === totalPages - 1}
    >
      <ArrowRightIcon />
    </button>
  );

  return (
    <div
      className={`flex justify-center mt-6 text-sm font-redHatText ${isMobile ? 'gap-1' : 'gap-2'}`}
    >
      {pages}
    </div>
  );
};
