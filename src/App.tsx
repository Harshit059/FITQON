import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/AdminLoginPage';
import UserDashboard from './pages/UserDashboard';
import CheckInForm from './pages/CheckInForm';
import AIResultsPage from './pages/AIResultsPage';
import AdminDashboard from './pages/AdminDashboard';
import { User } from './types';
import CyberBackground from './components/CyberBackground';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fitqon_token'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user details if token is stored
  useEffect(() => {
    async function loadMe() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setIsAdmin(data.isAdmin || false);
        } else {
          // Token outdated
          localStorage.removeItem('fitqon_token');
          setToken(null);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMe();
  }, [token]);

  const handleLogin = (newToken: string, loggedUser: User) => {
    localStorage.setItem('fitqon_token', newToken);
    setToken(newToken);
    setUser(loggedUser);
    setIsAdmin(loggedUser.isAdmin || false);
  };

  const handleLogout = () => {
    localStorage.removeItem('fitqon_token');
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-12 h-12 border-4 border-[#FACC15] border-t-transparent rounded-full flex items-center justify-center"
        >
          <Activity className="w-6 h-6 text-[#FACC15]" />
        </motion.div>
        <p className="mt-4 text-xs font-mono tracking-widest text-zinc-400 uppercase">Configuring FITQON Environment...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#020202] text-white font-sans flex flex-col antialiased relative overflow-x-hidden">
        {/* Global animated cyber background */}
        <CyberBackground />

        {/* TOP BAR / NAVIGATION */}
        <header className="border-b border-zinc-900 bg-black/45 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
            <Link to="/" className="flex items-center gap-3 group relative">
              {/* Dynamic Futuristic Telemetry Hex/Wave Icon */}
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FACC15] via-yellow-400 to-[#e49b0f] p-[1.5px] shadow-[0_0_15px_rgba(250,204,21,0.25)] group-hover:shadow-[0_0_25px_rgba(250,204,21,0.55)] group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-[#050508] rounded-[10px] flex items-center justify-center overflow-hidden relative">
                  {/* Slow rotating internal indicator */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                    className="absolute inset-0 opacity-25 bg-[conic-gradient(from_0deg,#FACC15,transparent_240deg)]"
                  />
                  <svg
                    className="w-5 h-5 text-[#FACC15] z-10 filter drop-shadow-[0_0_3px_rgba(250,204,21,0.65)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Double wave metric nodes */}
                    <path d="M3 12h2.5l1.5-3.5 2 7 1.5-5 1 2.5H13" />
                    <path d="M13 12.5l1.5-2 2 4.5 1.5-4 1 2H21" />
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-black font-sans text-xl sm:text-2xl tracking-tight leading-none text-white group-hover:text-[#FACC15] transition-colors uppercase">
                    FIT<span className="text-[#FACC15] font-black tracking-tighter filter drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">QON</span>
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#emerald-500] bg-emerald-500 animate-pulse mt-0.5" />
                </div>
                <span className="hidden sm:block font-mono text-[7.5px] tracking-[0.16em] text-[#FACC15]/90 uppercase font-black mt-1 group-hover:text-white transition-colors">
                  TRACK. IMPROVE. TRANSFORM.
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-[#FACC15] transition-colors"
                  >
                    My Log
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-xs font-mono uppercase tracking-wider text-[#FACC15] hover:underline flex items-center gap-1 bg-[#FACC15]/10 px-2.5 py-1 rounded border border-[#FACC15]/30"
                    >
                      <ShieldAlert className="w-3 h-3" /> Admin
                    </Link>
                  )}
                  <div className="h-6 w-px bg-zinc-800 hidden sm:block"></div>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1">
                    <UserIcon className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span className="text-[11px] font-mono font-bold text-zinc-300 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="bg-[#FACC15] text-black text-[9px] font-mono font-black rounded-full px-1.5 py-0.5">
                      🔥 {user.streak}d
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-red-950 hover:text-red-400 text-zinc-400 border border-zinc-800 hover:border-red-900 transition-all"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/admin-login"
                    className="text-xs font-mono tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors uppercase"
                  >
                    System Admin
                  </Link>
                  <Link
                    to="/auth"
                    className="bg-[#FACC15] text-black text-xs font-mono tracking-widest uppercase font-black px-4 py-2 rounded shadow-lg shadow-[#FACC15]/10 hover:shadow-[#FACC15]/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Access Portal
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* CONTAINER CONTENT ROUTING */}
        <main className="flex-1 flex flex-col relative z-10">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route
              path="/auth"
              element={
                user ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <AuthPage onLogin={handleLogin} />
                )
              }
            />
            
            <Route
              path="/admin-login"
              element={
                user && isAdmin ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <AdminLoginPage onLogin={handleLogin} />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                user ? (
                  <UserDashboard user={user} token={token!} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/checkin"
              element={
                user ? (
                  <CheckInForm user={user} token={token!} />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/results"
              element={
                user ? (
                  <AIResultsPage />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            <Route
              path="/admin"
              element={
                user && isAdmin ? (
                  <AdminDashboard token={token!} />
                ) : (
                  <Navigate to="/admin-login" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-zinc-900 bg-black/85 backdrop-blur-md py-8 relative z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-500 font-bold tracking-widest uppercase">
                FITQON ENGINE v2.1.0
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] text-zinc-600">PRODUCTION CORE READY</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-600">
              © 2026 FITQON LABS INC. NO EXCUSES. TRACK EVERYTHING.
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
