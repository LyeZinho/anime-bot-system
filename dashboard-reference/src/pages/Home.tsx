import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Server, 
  Library, 
  Activity, 
  ChevronRight, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { CharacterCard, StatCard } from '../components/Cards';
import { MOCK_CHARACTERS } from '../data';
import { Link } from 'react-router-dom';

export default function Home() {
  const topCharacters = MOCK_CHARACTERS.slice(0, 4);

  return (
    <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-20">
      {/* Hero Section */}
      <section className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <motion.div 
              className="inline-block bg-accent-pink text-black font-black px-3 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-sm uppercase tracking-tighter"
              whileHover={{ rotate: -3 }}
            >
              Vampire Vibes Only
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
              Collect Your <br />
              <span className="text-accent-purple">Waifus</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-lg font-medium">
              The most advanced character collection system. Inspired by the night, built for the bold. Join Nazuna in the ultimate anime hunt.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to="/characters" className="neobrutal-button flex items-center gap-2 group">
              EXPLORE CHARACTERS
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/rankings" className="px-6 py-3 bg-white text-black font-bold border-brutal shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              VIEW RANKINGS
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative z-10 neobrutal-card p-2 bg-accent-purple rotate-3 animate-float">
            <img 
              src="https://images.alphacoders.com/124/1246533.jpg" 
              alt="Nazuna Hero" 
              className="w-full h-auto border-brutal"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-accent-pink border-brutal -rotate-3 -z-10 translate-x-4 translate-y-4"></div>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Library />} label="Total Characters" value="12,450" color="bg-accent-blue" />
        <StatCard icon={<Users />} label="Active Users" value="85.2k" color="bg-accent-purple" />
        <StatCard icon={<Server />} label="Total Servers" value="1,240" color="bg-accent-pink" />
        <StatCard icon={<Activity />} label="Collections" value="1.2M" color="bg-accent-cyan" />
      </section>

      {/* Top Characters */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter">Popular Right Now</h2>
            <p className="text-text-secondary font-bold uppercase tracking-widest text-sm">Top trending characters this week</p>
          </div>
          <Link to="/rankings" className="hidden md:flex items-center gap-2 font-bold text-accent-purple hover:underline">
            SEE ALL <ChevronRight size={20} />
          </Link>
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {topCharacters.map(char => (
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
      </section>

      {/* Search & Filter Section (Preview) */}
      <section className="bg-bg-secondary border-brutal shadow-brutal p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input 
              type="text" 
              placeholder="SEARCH FOR A CHARACTER..." 
              className="w-full bg-bg-primary border-brutal p-4 pl-12 font-bold focus:outline-none focus:ring-2 focus:ring-accent-purple"
            />
          </div>
          <Link to="/characters" className="bg-white text-black font-bold border-brutal shadow-brutal px-8 py-4 flex items-center gap-2 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            <Filter size={20} />
            FILTERS
          </Link>
        </div>
      </section>
    </main>
  );
}
