import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { Rarity } from '../types';
import { Link } from 'react-router-dom';

interface StarRatingProps {
  initialRating: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  characterId?: string | number;
}

export function StarRating({ initialRating, onRate, readOnly = false, characterId }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (val: number) => {
    if (readOnly || isSubmitting) return;
    
    setRating(val);
    setIsSubmitting(true);

    // Simulated API call
    try {
      console.log(`Submitting rating ${val} for character ${characterId}...`);
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'mock-user-123',
          characterId: characterId,
          rating: val
        })
      });
      
      // Since it's a mock, we just wait a bit
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (onRate) onRate(val);
      alert(`Successfully rated ${val} stars!`);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={isSubmitting}
            whileHover={!readOnly && !isSubmitting ? { scale: 1.2 } : {}}
            onMouseEnter={() => !readOnly && !isSubmitting && setHover(star)}
            onMouseLeave={() => !readOnly && !isSubmitting && setHover(0)}
            onClick={() => handleRate(star)}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors ${isSubmitting ? 'opacity-50' : ''}`}
          >
            <Star
              size={14}
              fill={(hover || rating) >= star ? "currentColor" : "none"}
              className={(hover || rating) >= star ? "text-accent-yellow" : "text-gray-500"}
            />
          </motion.button>
        ))}
      </div>
      {!readOnly && rating > 0 && (
        <span className="text-[10px] font-black text-accent-yellow animate-pulse">
          {isSubmitting ? 'SAVING...' : `${rating}.0`}
        </span>
      )}
    </div>
  );
}

interface CharacterCardProps {
  id: string | number;
  name: string;
  series: string;
  image: string;
  rank?: number;
  rating: number;
  rarity: Rarity;
  key?: React.Key;
}

const RARITY_COLORS: Record<Rarity, string> = {
  Common: 'bg-white',
  Rare: 'bg-accent-blue',
  Epic: 'bg-accent-purple',
  Legendary: 'bg-accent-pink',
};

export function CharacterCard({ id, name, series, image, rank, rating, rarity }: CharacterCardProps) {
  const displayImage = image || `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/800`;

  return (
    <motion.div 
      className="neobrutal-card group overflow-hidden flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-[3/4] overflow-hidden border-b-brutal">
        <img 
          src={displayImage} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {rank && (
          <div className="absolute top-2 left-2 bg-accent-yellow text-black font-black px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            #{rank}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <div className={`${RARITY_COLORS[rarity]} text-black neobrutal-tag uppercase`}>
            {rarity}
          </div>
        </div>
        <div className="absolute bottom-2 right-2">
          <div className="bg-bg-card text-white neobrutal-tag flex items-center gap-1 px-2 py-1">
            <StarRating initialRating={rating} readOnly />
          </div>
        </div>
      </div>
      <div className="p-4 bg-bg-card flex flex-col flex-1">
        <h3 className="font-black text-xl uppercase tracking-tighter truncate">{name}</h3>
        <p className="text-text-secondary text-xs font-bold uppercase tracking-widest truncate mb-4">{series}</p>
        
        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center bg-black/20 p-2 border-2 border-black">
            <span className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">RATE THIS:</span>
            <StarRating characterId={id} initialRating={0} onRate={(r) => console.log(`Rated ${name} with ${r} stars`)} />
          </div>
          
          <Link 
            to={`/characters/${id}`}
            className="block w-full text-center py-2 bg-accent-blue text-black font-bold border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            VIEW DETAILS
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}

export function StatCard({ icon, label, value, color = 'bg-accent-purple' }: StatCardProps) {
  return (
    <motion.div 
      className="neobrutal-card p-6 flex items-center gap-4"
      whileHover={{ scale: 1.02 }}
    >
      <div className={`${color} p-3 border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black`}>
        {icon}
      </div>
      <div>
        <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}
