import React from 'react';
import { motion } from 'motion/react';
import { User, Library, Heart, History, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_CHARACTERS } from '../data';
import { CharacterCard } from '../components/Cards';

export default function Profile() {
  const collection = MOCK_CHARACTERS.slice(0, 3);
  const favorites = MOCK_CHARACTERS.slice(3, 6);

  return (
    <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-12">
      {/* Profile Header */}
      <section className="neobrutal-card p-8 bg-accent-purple flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 border-brutal shadow-brutal overflow-hidden bg-white">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nazuna" 
            alt="User Avatar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Pedro Kaleb</h1>
            <p className="text-black/60 font-bold uppercase tracking-widest text-sm">Member since March 2026</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="bg-black text-white px-4 py-2 border-2 border-black font-bold text-sm uppercase tracking-tighter">
              COLLECTION: 124
            </div>
            <div className="bg-white text-black px-4 py-2 border-2 border-black font-bold text-sm uppercase tracking-tighter">
              FAVORITES: 42
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/settings">
            <button className="p-3 bg-white text-black border-brutal shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <Settings size={20} />
            </button>
          </Link>
          <Link to="/login">
            <button className="p-3 bg-accent-pink text-black border-brutal shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <LogOut size={20} />
            </button>
          </Link>
        </div>
      </section>

      {/* Collection Tabs */}
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Collection Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <Library className="text-accent-purple" size={32} />
              <h2 className="text-3xl font-black uppercase tracking-tighter">Your Collection</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {collection.map(char => (
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
            <button className="w-full py-4 border-2 border-dashed border-white/20 text-white/40 font-bold uppercase tracking-widest hover:border-accent-purple hover:text-accent-purple transition-all">
              VIEW FULL COLLECTION
            </button>
          </section>

          {/* Favorites Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <Heart className="text-accent-pink" size={32} />
              <h2 className="text-3xl font-black uppercase tracking-tighter">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {favorites.map(char => (
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
        </div>

        {/* Sidebar Activity */}
        <aside className="space-y-8">
          <div className="neobrutal-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <History className="text-accent-blue" size={24} />
              <h3 className="text-xl font-black uppercase tracking-tighter">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              <ActivityItem text="Collected Nazuna Nanakusa" time="2h ago" />
              <ActivityItem text="Rated Makima 5 stars" time="5h ago" />
              <ActivityItem text="Added Power to favorites" time="1d ago" />
              <ActivityItem text="Reached Rank #124" time="2d ago" />
            </div>
          </div>

          <div className="neobrutal-card p-6 bg-accent-blue text-black space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tighter">Pro Member</h3>
            <p className="text-sm font-medium">Unlock exclusive characters and unlimited collection space.</p>
            <button className="w-full py-2 bg-black text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              UPGRADE NOW
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ActivityItem({ text, time }: { text: string, time: string }) {
  return (
    <div className="border-l-2 border-accent-blue pl-4 space-y-1">
      <p className="text-sm font-bold uppercase tracking-widest leading-tight">{text}</p>
      <p className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">{time}</p>
    </div>
  );
}
