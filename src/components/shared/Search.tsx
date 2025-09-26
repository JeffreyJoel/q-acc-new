'use client';

import { Search, X } from 'lucide-react';

const categories = [
  { id: 'DeFi', name: 'DeFi' },
  { id: 'Gaming', name: 'Gaming' },
  { id: 'Infrastructure', name: 'Infrastructure' },
  { id: 'DAO', name: 'DAO' },
  { id: 'Lending', name: 'Lending' },
  { id: 'Yield', name: 'Yield' },
  { id: 'Social', name: 'Social' },
  { id: 'Music', name: 'Music' },
];

const seasons = [
  { id: '1', name: 'Season 1' },
  { id: '2', name: 'Season 2' },
];

interface SearchComponentProps {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedSeasons: string[];
  setSelectedSeasons: (seasons: string[]) => void;
}

const SearchComponent = ({
  searchText,
  setSearchText,
  selectedCategories,
  setSelectedCategories,
  selectedSeasons,
  setSelectedSeasons,
}: SearchComponentProps) => {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const toggleSeason = (seasonId: string) => {
    if (selectedSeasons.includes(seasonId)) {
      setSelectedSeasons(selectedSeasons.filter(id => id !== seasonId));
    } else {
      setSelectedSeasons([...selectedSeasons, seasonId]);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSelectedCategories([]);
    setSelectedSeasons([]);
  };

  return (
    <div className='p-4 mb-6'>
      <div className='flex flex-col gap-6'>
        <div className='relative w-full max-w-3xl mx-auto'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <Search className='w-5 h-5 text-gray-400' />
          </div>
          <input
            type='text'
            className='block w-full p-4 pl-10 text-sm text-white bg-neutral-800 rounded-full focus:ring-peach-400 focus:border-peach-400 outline-none'
            placeholder='Search projects by name, description, or category...'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {(searchText ||
            selectedCategories.length > 0 ||
            selectedSeasons.length > 0) && (
            <button
              onClick={clearSearch}
              className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-neutral-600 hover:bg-neutral-500 transition-colors'
              aria-label='Clear search'
            >
              <X className='w-4 h-4 text-white' />
            </button>
          )}
        </div>
        <div>
          <div className='flex max-w-3xl mx-auto flex-wrap justify-center gap-3'>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(category.id)
                    ? 'bg-peach-400 text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-peach-400 hover:text-black'
                }`}
              >
                {category.name}
              </button>
            ))}

            {seasons.map(season => (
              <button
                key={season.id}
                onClick={() => toggleSeason(season.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSeasons.includes(season.id)
                    ? 'bg-peach-400 text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-peach-400 hover:text-black'
                }`}
              >
                {season.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;
