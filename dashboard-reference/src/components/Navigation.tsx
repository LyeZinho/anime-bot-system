import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, Trophy, User, LogIn, BarChart2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
        <Link to="/">
          <motion.div 
            className="bg-accent-purple border-brutal shadow-brutal px-4 py-2 flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-black font-black text-xl tracking-tighter">NAZUNA BOT</span>
          </motion.div>
        </Link>

        <div className="flex gap-4 items-center">
          <div className="hidden md:flex gap-2 bg-bg-card border-brutal shadow-brutal p-1">
            <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Home" active={location.pathname === '/'} />
            <NavLink to="/characters" icon={<Users size={18} />} label="Characters" active={location.pathname === '/characters'} />
            <NavLink to="/rankings" icon={<Trophy size={18} />} label="Rankings" active={location.pathname === '/rankings'} />
            <NavLink to="/statistics" icon={<BarChart2 size={18} />} label="Stats" active={location.pathname === '/statistics'} />
            <NavLink to="/profile" icon={<User size={18} />} label="Profile" active={location.pathname === '/profile'} />
          </div>

          <Link to="/login">
            <motion.button 
              className="bg-accent-pink text-black font-bold border-brutal shadow-brutal px-4 py-2 flex items-center gap-2 pointer-events-auto"
              whileHover={{ scale: 1.05, x: 2, y: 2, shadow: "none" }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">LOGIN</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label, active = false }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link to={to}>
      <motion.button 
        className={`flex items-center gap-2 px-3 py-1.5 font-bold transition-colors ${active ? 'bg-accent-purple text-black' : 'text-white hover:bg-white/10'}`}
        whileHover={{ y: -2 }}
      >
        {icon}
        <span className="text-sm uppercase tracking-wider">{label}</span>
      </motion.button>
    </Link>
  );
}
