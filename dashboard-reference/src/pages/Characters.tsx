import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import { CharacterCard } from '../components/Cards';
import { MOCK_CHARACTERS } from '../data';

export default function Characters() {
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('All');
  const [genderFilter, setGenderFilter] = useState<string>('All');
  const [hairFilter, setHairFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('rank');
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTarget = useRef(null);

  const filteredCharacters = MOCK_CHARACTERS.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase()) || 
                         char.series.toLowerCase().includes(search.toLowerCase());
    const matchesRarity = rarityFilter === 'All' || char.rarity === rarityFilter;
    const matchesGender = genderFilter === 'All' || char.gender === genderFilter;
    const matchesHair = hairFilter === 'All' || char.hairColor === hairFilter;
    return matchesSearch && matchesRarity && matchesGender && matchesHair;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rank') return (a.rank || 999) - (b.rank || 999);
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
    return 0;
  });

  const clearFilters = () => {
    setSearch('');
    setRarityFilter('All');
    setGenderFilter('All');
    setHairFilter('All');
    setSortBy('rank');
  };

  const isFiltered = search || rarityFilter !== 'All' || genderFilter !== 'All' || hairFilter !== 'All' || sortBy !== 'rank';

  useEffect(() => {
    setVisibleCount(12);
  }, [search, rarityFilter, genderFilter, hairFilter, sortBy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < filteredCharacters.length) {
          setVisibleCount(prev => prev + 12);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, visibleCount, filteredCharacters.length]);

  const displayedCharacters = filteredCharacters.slice(0, visibleCount);

  return (
    <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-12">
      <header className="space-y-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Characters</h1>
        <p className="text-text-secondary font-bold uppercase tracking-widest">Explore and collect your favorite characters</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-72 space-y-8">
          <div className="neobrutal-card p-6 space-y-8 sticky top-24">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name or series..." 
                  className="w-full bg-bg-primary border-2 border-black p-2 pl-10 text-sm font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">Sort By</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-bg-primary border-2 border-black p-2 text-sm font-bold focus:outline-none"
              >
                <option value="rank">Rank (Low to High)</option>
                <option value="name">Name (A-Z)</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="views">Views (High to Low)</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">Rarity</label>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Common', 'Rare', 'Epic', 'Legendary'].map(rarity => (
                  <button 
                    key={rarity}
                    onClick={() => setRarityFilter(rarity)}
                    className={`text-center px-2 py-1.5 border-2 border-black font-bold text-[10px] transition-all ${rarityFilter === rarity ? 'bg-accent-purple text-black shadow-[2px_2px_0px_0px_#000]' : 'hover:bg-white/5'}`}
                  >
                    {rarity.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">Gender</label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Female', 'Male', 'Other'].map(gender => (
                  <button 
                    key={gender}
                    onClick={() => setGenderFilter(gender)}
                    className={`px-3 py-1.5 border-2 border-black font-bold text-[10px] transition-all ${genderFilter === gender ? 'bg-accent-blue text-black shadow-[2px_2px_0px_0px_#000]' : 'hover:bg-white/5'}`}
                  >
                    {gender.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">Hair Color</label>
              <select 
                value={hairFilter}
                onChange={(e) => setHairFilter(e.target.value)}
                className="w-full bg-bg-primary border-2 border-black p-2 text-sm font-bold focus:outline-none"
              >
                <option value="All">All Colors</option>
                <option value="Pink">Pink</option>
                <option value="Red">Red</option>
                <option value="Blonde">Blonde</option>
                <option value="Black">Black</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            {isFiltered && (
              <button 
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-tighter text-accent-pink hover:underline"
              >
                <X size={14} /> Reset All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Character Grid */}
        <div className="flex-1 space-y-8">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold uppercase tracking-widest text-text-secondary">
              Showing {filteredCharacters.length} characters
            </p>
          </div>

          {filteredCharacters.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedCharacters.map(char => (
                  <CharacterCard 
                    key={char.id} 
                    id={char.id}
                    name={char.name}
                    series={char.series}
                    image={char.image}
                    rank={char.rank}
                    rating={char.rating}
                    rarity={char.rarity}
                  />
                ))}
              </div>

              {visibleCount < filteredCharacters.length && (
                <div ref={observerTarget} className="flex justify-center py-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="text-accent-purple" size={32} />
                  </motion.div>
                </div>
              )}
            </div>
          ) : (
            <div className="neobrutal-card p-20 text-center space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter">No characters found</h3>
              <p className="text-text-secondary">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
