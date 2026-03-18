import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import BackgroundSVG from './components/BackgroundSVG';
import Home from './pages/Home';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        <BackgroundSVG />
        <Navigation />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/characters/:id" element={<CharacterDetail />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        {/* Global Footer (Optional, can be inside pages if they differ) */}
        <footer className="max-w-7xl mx-auto px-4 py-12 border-t-brutal flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="bg-accent-purple border-brutal shadow-brutal p-2 font-black text-black">NB</div>
            <p className="font-bold text-text-secondary uppercase tracking-widest text-xs">© 2026 NAZUNA BOT. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="font-bold hover:text-accent-purple transition-colors uppercase tracking-widest text-xs">DISCORD</a>
            <a href="#" className="font-bold hover:text-accent-purple transition-colors uppercase tracking-widest text-xs">TWITTER</a>
            <a href="#" className="font-bold hover:text-accent-purple transition-colors uppercase tracking-widest text-xs">GITHUB</a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
