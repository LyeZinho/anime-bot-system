import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Shield, Palette, Globe, Save, ArrowLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const [username, setUsername] = useState('Pedro Kaleb');
  const [bio, setBio] = useState('Avid collector of rare vampires and devil hunters.');
  const [notifications, setNotifications] = useState(true);
  const [isPublic, setIsPublic] = useState(true);

  return (
    <main className="pt-24 pb-20 px-4 max-w-4xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <Link to="/profile" className="inline-flex items-center gap-2 text-accent-purple font-bold hover:underline mb-2">
            <ArrowLeft size={18} /> BACK TO PROFILE
          </Link>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Settings</h1>
        </div>
        <button className="neobrutal-button flex items-center gap-2 bg-accent-green">
          <Save size={20} /> SAVE CHANGES
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar Tabs */}
        <aside className="space-y-2">
          <SettingsTab icon={<User size={18} />} label="Profile" active />
          <SettingsTab icon={<Bell size={18} />} label="Notifications" />
          <SettingsTab icon={<Shield size={18} />} label="Privacy & Security" />
          <SettingsTab icon={<Palette size={18} />} label="Appearance" />
          <SettingsTab icon={<Globe size={18} />} label="Language" />
        </aside>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Section */}
          <section className="neobrutal-card p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-24 h-24 border-brutal shadow-brutal overflow-hidden bg-white">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nazuna" 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tighter">Profile Picture</h3>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">JPG, PNG or SVG. Max 2MB.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">Display Name</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-bg-primary border-2 border-black p-3 font-bold focus:outline-none focus:border-accent-purple"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-text-secondary">Bio</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-bg-primary border-2 border-black p-3 font-bold focus:outline-none focus:border-accent-purple resize-none"
                />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="neobrutal-card p-8 space-y-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Preferences</h3>
            
            <div className="space-y-6">
              <ToggleItem 
                label="Email Notifications" 
                description="Receive updates about new characters and events."
                active={notifications}
                onToggle={() => setNotifications(!notifications)}
              />
              <ToggleItem 
                label="Public Profile" 
                description="Allow others to view your collection and rankings."
                active={isPublic}
                onToggle={() => setIsPublic(!isPublic)}
              />
            </div>
          </section>

          <section className="neobrutal-card p-8 bg-accent-pink/10 border-accent-pink/50">
            <h3 className="text-xl font-black uppercase tracking-tighter text-accent-pink">Danger Zone</h3>
            <p className="text-sm font-bold text-text-secondary uppercase tracking-widest mt-2 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="px-6 py-2 bg-accent-pink text-black font-black uppercase tracking-tighter border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
              DELETE ACCOUNT
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

function SettingsTab({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-black font-bold text-sm uppercase tracking-tighter transition-all ${active ? 'bg-accent-purple text-black shadow-[4px_4px_0px_0px_#000]' : 'hover:bg-white/5'}`}>
      {icon}
      {label}
    </button>
  );
}

function ToggleItem({ label, description, active, onToggle }: { label: string, description: string, active: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <p className="font-black uppercase tracking-tighter">{label}</p>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 border-2 border-black relative transition-colors ${active ? 'bg-accent-purple' : 'bg-bg-secondary'}`}
      >
        <motion.div 
          className="absolute top-0.5 left-0.5 w-4 h-4 bg-black border border-black"
          animate={{ x: active ? 24 : 0 }}
        />
      </button>
    </div>
  );
}
