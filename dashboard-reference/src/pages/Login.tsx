import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Shield, MessageSquare, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDiscordLogin = () => {
    setIsLoading(true);
    // Simulate Discord OAuth flow
    setTimeout(() => {
      setIsLoading(false);
      navigate('/profile');
    }, 1500);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full space-y-12">
        <header className="text-center space-y-4">
          <motion.div 
            className="inline-block bg-accent-purple p-4 border-brutal shadow-brutal mb-4"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <LogIn size={48} className="text-black" />
          </motion.div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Welcome Back</h1>
          <p className="text-text-secondary font-bold uppercase tracking-widest">Connect your Discord to start collecting</p>
        </header>

        <section className="neobrutal-card p-8 space-y-8 bg-bg-card">
          <div className="space-y-6">
            <FeatureItem icon={<Shield size={18} />} text="Secure OAuth2 Connection" />
            <FeatureItem icon={<MessageSquare size={18} />} text="Sync with Discord Servers" />
            <FeatureItem icon={<Zap size={18} />} text="Instant Collection Access" />
          </div>

          <button 
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full py-4 bg-[#5865F2] text-white font-black uppercase tracking-tighter border-2 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <motion.div 
                className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <DiscordIcon />
                LOGIN WITH DISCORD
              </>
            )}
          </button>

          <p className="text-[10px] font-black uppercase tracking-tighter text-text-secondary text-center">
            By logging in, you agree to our <span className="text-accent-purple underline cursor-pointer">Terms of Service</span> and <span className="text-accent-purple underline cursor-pointer">Privacy Policy</span>.
          </p>
        </section>

        <footer className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 font-bold text-accent-purple hover:underline uppercase tracking-widest text-xs"
          >
            CONTINUE AS GUEST <ArrowRight size={14} />
          </button>
        </footer>
      </div>
    </main>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white/5 border border-white/10 text-accent-purple">
        {icon}
      </div>
      <p className="text-sm font-bold uppercase tracking-widest">{text}</p>
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}
