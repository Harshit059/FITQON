import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, AlertCircle, Terminal, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';

interface AdminLoginPageProps {
  onLogin: (token: string, user: User) => void;
}

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unauthorized admin access.');
      }

      onLogin(data.token, data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-transparent text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Cyber Grid lines */}
      <div className="absolute inset-0 bg-cyber bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-20"></div>
      
      <div className="w-full max-w-sm premium-card p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FACC15] shadow-[0_0_15px_#FACC15]"></div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/20 mx-auto flex items-center justify-center mb-4 shadow-xl">
            <Lock className="w-5 h-5 text-[#FACC15]" />
          </div>
          <h3 className="text-xl font-black font-sans text-white tracking-tight uppercase">
            FIT<span className="text-[#FACC15]">QON</span> ADMIN PORTAL
          </h3>
          <p className="text-[9px] font-mono text-zinc-500 mt-1.5 uppercase tracking-widest font-black">
            Secure Core Verification Protocol
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 bg-red-950/45 border border-red-900/50 text-red-300 p-3.5 rounded-xl text-xs text-left mb-4"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[9px] font-mono tracking-widest uppercase text-zinc-400 mb-1.5">
              Admin Password Credential
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. admin123"
                className="w-full bg-zinc-950 border border-zinc-900 placeholder-zinc-700 text-xs p-3.5 pr-10 rounded-lg text-white focus:outline-none focus:border-[#FACC15]/45 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#FACC15] transition-colors cursor-pointer"
                id="btn-toggle-admin-password"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FACC15] text-black font-mono font-black py-3.5 rounded-xl text-xs uppercase tracking-widest hover:bg-white active:scale-95 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:scale-100 transition-all flex items-center justify-center gap-2 glow-btn cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Terminal className="w-4 h-4" /> Verify Credentials
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
