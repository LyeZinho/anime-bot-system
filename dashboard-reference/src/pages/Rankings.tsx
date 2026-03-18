import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, TrendingUp, Eye } from 'lucide-react';
import { MOCK_CHARACTERS } from '../data';
import { Link } from 'react-router-dom';

export default function Rankings() {
  const [activeTab, setActiveTab] = useState<'popularity' | 'ratings' | 'combined'>('popularity');

  const sortedCharacters = [...MOCK_CHARACTERS].sort((a, b) => {
    if (activeTab === 'popularity') return (b.views || 0) - (a.views || 0);
    if (activeTab === 'ratings') return b.rating - a.rating;
    return (b.views || 0) * b.rating - (a.views || 0) * a.rating;
  });

  return (
    <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-12">
      <header className="space-y-4">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Rankings</h1>
        <p className="text-text-secondary font-bold uppercase tracking-widest">The most popular and top-rated characters</p>
      </header>

      <div className="flex flex-wrap gap-4 border-b-brutal pb-8">
        <TabButton 
          active={activeTab === 'popularity'} 
          onClick={() => setActiveTab('popularity')} 
          icon={<Eye size={18} />} 
          label="Popularity" 
        />
        <TabButton 
          active={activeTab === 'ratings'} 
          onClick={() => setActiveTab('ratings')} 
          icon={<Star size={18} />} 
          label="Ratings" 
        />
        <TabButton 
          active={activeTab === 'combined'} 
          onClick={() => setActiveTab('combined')} 
          icon={<TrendingUp size={18} />} 
          label="Combined" 
        />
      </div>

      <div className="space-y-6">
        {sortedCharacters.map((char, index) => (
          <motion.div 
            key={char.id}
            className="neobrutal-card p-4 flex flex-col md:flex-row items-center gap-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
          >
            <div className={`text-4xl font-black tracking-tighter w-16 text-center ${index < 3 ? 'text-accent-yellow' : 'text-text-secondary'}`}>
              #{index + 1}
            </div>

            <div className="w-24 h-24 flex-shrink-0 border-brutal overflow-hidden">
              <img 
                src={char.image} 
                alt={char.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 space-y-1 text-center md:text-left">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{char.name}</h3>
              <p className="text-sm font-bold text-accent-purple uppercase tracking-widest">{char.series}</p>
            </div>

            <div className="flex gap-8">
              <StatItem label="Views" value={char.views?.toLocaleString() || '0'} />
              <StatItem label="Rating" value={char.rating.toFixed(1)} />
            </div>

            <Link 
              to={`/characters/${char.id}`}
              className="px-6 py-2 bg-accent-blue text-black font-bold border-brutal shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              VIEW
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 border-brutal font-black uppercase tracking-tighter transition-all ${active ? 'bg-accent-purple text-black shadow-brutal' : 'hover:bg-white/5'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">{label}</p>
      <p className="text-xl font-black tracking-tighter">{value}</p>
    </div>
  );
}
