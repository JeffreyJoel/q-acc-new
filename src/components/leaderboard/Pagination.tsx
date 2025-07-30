'use client';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import React from 'react';

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
  const maxPagesToShow = 5;

  const pages = [];
  const startPage = Math.max(
    0,
    Math.min(
      currentPage - Math.floor(maxPagesToShow / 2),
      totalPages - maxPagesToShow,
    ),
  );
  const endPage = Math.min(totalPages, startPage + maxPagesToShow);

  pages.push(
    <button
      key='prev'
      onClick={() => {
        if(currentPage > 0) {
          onPageChange(currentPage - 1);
        }
      }}
      className={`h-11 w-11 flex items-center justify-center bg-white/5 rounded-[8px] ${currentPage === 0 ? 'text-white/30' : 'text-white hover:text-white'} `}
    >
      <ArrowLeftIcon/>
    </button>
  );

  for (let i = startPage; i < endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)} 
        className={` bg-white/5 rounded-[8px] px-3 text-lg font-medium h-11 w-11 flex items-center justify-center ${
          i === currentPage
            ? 'text-peach-400'
            : 'text-white/50 hover:text-white'
        }`}
      >
        {i + 1}
      </button>,
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(
        <span key='end-ellipsis' className='h-11 w-11 px-3 text-lg font-medium flex justify-center items-end'>
          …
        </span>,
      );
    }
    pages.push(
      <button
        key={totalPages - 1}
        onClick={() => onPageChange(totalPages - 1)}
        className='h-11 w-11 flex items-center justify-center bg-white/5 rounded-[8px] text-white hover:text-peach-400 px-3 text-lg font-medium'
      >
        {totalPages}
      </button>,
    );
  }

  if (currentPage + 1 < totalPages) {
    pages.push(
      <button
        key='next'
        onClick={() => {
          if (currentPage < totalPages - 1) {
            onPageChange(currentPage + 1);
          }
        }}
        className={`h-11 w-11 flex items-center justify-center bg-white/5 rounded-[8px] ${currentPage === totalPages - 1 ? 'text-white/30' : 'text-white hover:text-white'} `}
        disabled={currentPage === totalPages - 1}
      >
        <ArrowRightIcon/>
      </button>
    );
  }

  return (
    <div className='flex gap-2 justify-center mt-6 text-sm font-redHatText'>
      {pages}
    </div>
  );
};
