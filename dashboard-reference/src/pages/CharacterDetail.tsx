import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MOCK_CHARACTERS } from '../data';
import { StarRating } from '../components/Cards';

export default function CharacterDetail() {
  const { id } = useParams<{ id: string }>();
  const character = MOCK_CHARACTERS.find(c => c.id.toString() === id);

  if (!character) {
    return (
      <main className="pt-32 px-4 max-w-7xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Character Not Found</h1>
        <Link to="/characters" className="neobrutal-button inline-flex items-center gap-2">
          <ArrowLeft size={20} /> BACK TO CHARACTERS
        </Link>
      </main>
    );
  }

  const relatedCharacters = MOCK_CHARACTERS.filter(c => c.id !== character.id).slice(0, 3);

  return (
    <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-12">
      <Link to="/characters" className="inline-flex items-center gap-2 font-bold text-accent-purple hover:underline">
        <ArrowLeft size={18} /> BACK TO CHARACTERS
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Character Image */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="neobrutal-card p-2 bg-accent-purple rotate-1">
            <img 
              src={character.image} 
              alt={character.name} 
              className="w-full h-auto border-brutal"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-accent-pink border-brutal -rotate-1 -z-10 translate-x-4 translate-y-4"></div>
        </motion.div>

        {/* Character Info */}
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-accent-yellow text-black font-black px-3 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-sm uppercase tracking-tighter">
                RANK #{character.rank}
              </div>
              <div className="bg-accent-pink text-black font-black px-3 py-1 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-sm uppercase tracking-tighter">
                {character.rarity}
              </div>
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">{character.name}</h1>
            <p className="text-2xl font-bold text-accent-purple uppercase tracking-widest">{character.series}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatItem icon={<Eye size={18} />} label="Views" value={character.views?.toLocaleString() || '0'} />
            <StatItem icon={<Star size={18} />} label="Rating" value={character.rating.toFixed(1)} />
            <StatItem icon={<Heart size={18} />} label="Favorites" value="12.4k" />
            <StatItem icon={<TrendingUp size={18} />} label="Trend" value="+12%" />
          </div>

          <div className="neobrutal-card p-6 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tighter">Description</h3>
            <p className="text-text-secondary leading-relaxed">{character.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <DetailItem label="Gender" value={character.gender || 'Unknown'} />
            <DetailItem label="Personality" value={character.personality || 'Unknown'} />
            <DetailItem label="Hair Color" value={character.hairColor || 'Unknown'} />
          </div>

          {/* Trend Chart */}
          {character.trend && (
            <div className="neobrutal-card p-6 space-y-6">
              <div className="flex items-center gap-2">
                <BarChart2 className="text-accent-pink" size={24} />
                <h3 className="text-xl font-black uppercase tracking-tighter">Popularity Trend</h3>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={character.trend}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F472B6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F472B6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => val.split('-')[1]}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151619', border: '2px solid #000', borderRadius: '0' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      labelStyle={{ color: '#888', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#F472B6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest text-center">
                Last 6 months view activity
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button className="neobrutal-button flex items-center gap-2">
              <Heart size={20} /> ADD TO COLLECTION
            </button>
            <button className="px-6 py-3 bg-white text-black font-bold border-brutal shadow-brutal flex items-center gap-2 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              <Share2 size={20} /> SHARE
            </button>
          </div>
        </motion.div>
      </div>

      {/* Related Characters */}
      <section className="space-y-8 pt-12 border-t-brutal">
        <div className="flex justify-between items-end">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Related Characters</h2>
          <Link to="/characters" className="font-bold text-accent-purple hover:underline flex items-center gap-1">
            VIEW ALL <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {relatedCharacters.map(char => (
            <Link key={char.id} to={`/characters/${char.id}`} className="neobrutal-card group overflow-hidden">
              <div className="aspect-[3/4] overflow-hidden border-b-brutal">
                <img 
                  src={char.image} 
                  alt={char.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4">
                <h4 className="font-black uppercase tracking-tighter truncate">{char.name}</h4>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest truncate">{char.series}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-bg-secondary border-2 border-black p-3 space-y-1">
      <div className="flex items-center gap-2 text-accent-purple">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">{label}</span>
      </div>
      <p className="text-lg font-black tracking-tighter">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">{label}</p>
      <p className="font-bold text-sm uppercase tracking-widest">{value}</p>
    </div>
  );
}
