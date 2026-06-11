import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (token: string, user: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = activeTab === 'login' ? { email, password } : { name, email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong during authentication');
      }

      onLogin(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-transparent text-white flex flex-col items-center justify-center p-4 relative overflow-hidden cyber-grid">
      {/* Background radial overlays */}
      <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] bg-[#FACC15]/4 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md premium-card p-6 sm:p-10 rounded-xl relative overflow-hidden z-10 animate-fade-in-up">
        {/* Yellow cybernetic highlight strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#FACC15] to-transparent"></div>

        <div className="text-center mb-8">
          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-[#FACC15] px-2.5 py-1 rounded font-mono font-black uppercase tracking-widest">
            SECURE ACCESS PORTAL
          </span>
          <h2 className="text-3xl font-black font-sans tracking-tight mt-3 uppercase">
            FIT<span className="text-[#FACC15]">QON</span> GATEWAY
          </h2>
          <p className="text-[10px] font-mono mt-1.5 uppercase tracking-widest text-[#FACC15] font-bold">
            {activeTab === 'login' ? 'VERIFY ATHELETE CREDENTIALS' : 'JOIN THE ELITE PROGRAM'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 bg-zinc-950 border border-zinc-900 p-1 rounded-lg mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`py-2.5 text-xs font-mono font-black rounded-md uppercase transition-all tracking-wider ${
              activeTab === 'login'
                ? 'bg-[#FACC15] text-black shadow-md shadow-[#FACC15]/10'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`py-2.5 text-xs font-mono font-black rounded-md uppercase transition-all tracking-wider ${
              activeTab === 'register'
                ? 'bg-[#FACC15] text-black shadow-md shadow-[#FACC15]/10'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Enroll User
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 bg-red-950/20 border border-red-900/30 text-red-300 p-3.5 rounded-lg mb-5 text-xs text-left"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
          {activeTab === 'register' && (
            <div>
              <label className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5 font-bold">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maverick Mercer"
                className="w-full bg-zinc-950/80 border border-zinc-900 placeholder-zinc-700 text-xs p-3.5 rounded-lg text-white focus:outline-none focus:border-[#FACC15]/60 focus:ring-1 focus:ring-[#FACC15]/10 transition-all font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5 font-bold">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. athletic@fitqon.com"
              className="w-full bg-zinc-950/80 border border-zinc-900 placeholder-zinc-700 text-xs p-3.5 rounded-lg text-white focus:outline-none focus:border-[#FACC15]/60 focus:ring-1 focus:ring-[#FACC15]/10 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5 font-bold">
              Account Security Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode key..."
                className="w-full bg-zinc-950/80 border border-zinc-900 placeholder-zinc-700 text-xs p-3.5 rounded-lg pr-10 text-white focus:outline-none focus:border-[#FACC15]/60 focus:ring-1 focus:ring-[#FACC15]/10 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#FACC15] transition-colors cursor-pointer"
                id="btn-toggle-auth-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FACC15] text-black font-mono font-black py-4 rounded-lg text-xs uppercase tracking-widest hover:bg-white hover:scale-[1.01] active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:scale-100 transition-all flex items-center justify-center gap-2 mt-4 glow-btn"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : activeTab === 'login' ? (
              <>
                <LogIn className="w-3.5 h-3.5 font-black" /> Perform Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 font-black" /> Register & Authenticate
              </>
            )}
          </button>
        </form>

        <p className="text-[9px] font-mono text-center mt-6 uppercase tracking-widest text-zinc-500">
          {activeTab === 'login' ? 'Passcode forgotten? Ask FITQON Admin' : 'Already registered? Sign In above'}
        </p>
      </div>
    </div>
  );
}
