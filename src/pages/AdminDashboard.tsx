import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users as UsersIcon,
  Activity,
  Award,
  Download,
  Calendar,
  Search,
  Filter,
  Flame,
  Terminal,
  Shield,
  Clock,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts';

interface AdminDashboardProps {
  token: string;
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'feed'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // SEARCH AND FILTER STATES (For Users List)
  const [userQuery, setUserQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [selectedUserHistory, setSelectedUserHistory] = useState<any>(null);

  // REPORT GENERATION STATES
  const [reportStart, setReportStart] = useState('2026-05-01');
  const [reportEnd, setReportEnd] = useState('2026-06-06');
  const [reportFormat, setReportFormat] = useState('csv');

  // Load Admin Data from API
  const loadAdminMetrics = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsRes = await fetch('/api/admin/stats', { headers });
      const usersRes = await fetch('/api/admin/users', { headers });
      const feedRes = await fetch('/api/admin/feed', { headers });

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsersList(await usersRes.json());
      if (feedRes.ok) setLiveFeed(await feedRes.json());
    } catch (err) {
      console.error('Failed to query admin control endpoints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
  }, [token]);

  // Inspect individual user checks history custom function
  const handleInspectUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setSelectedUserHistory(await response.json());
      }
    } catch (err) {
      console.error('Failed to load specific user log records.');
    }
  };

  // Compile and request CSV sheets triggers
  const handleDownloadReport = () => {
    const url = `/api/admin/generate-report?startDate=${reportStart}&endDate=${reportEnd}&format=${reportFormat}`;
    
    // Create virtual download element
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
  };

  // Recharts custom tooltips mapping styles
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-[#FACC15]/40 p-2 text-[11px] font-mono rounded">
          <p className="text-[#FACC15] font-bold">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 bg-transparent text-white flex flex-col items-center justify-center p-8">
        <span className="w-12 h-12 border-4 border-t-transparent border-[#FACC15] rounded-full animate-spin"></span>
        <p className="text-xs font-mono text-zinc-500 mt-4 uppercase tracking-widest animate-pulse">
          Querying Core Administration Portals...
        </p>
      </div>
    );
  }

  // Filtered lists computation
  const filteredUsers = usersList.filter((usr) => {
    const matchesQuery =
      usr.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      usr.email.toLowerCase().includes(userQuery.toLowerCase());
    const matchesRating = ratingFilter === '' || usr.averageRating === ratingFilter;
    return matchesQuery && matchesRating;
  });

  return (
    <div className="flex-1 bg-transparent text-white p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start animate-fade-in-up">
      
      {/* SaaS Sidebar navigation area */}
      <div className="lg:col-span-3 premium-card p-5 space-y-6 w-full rounded-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FACC15] rounded-t-2xl shadow-[0_0_15px_#FACC15]"></div>
        <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-900">
          <Shield className="w-5 h-5 text-[#FACC15] shrink-0" />
          <div>
            <h3 className="text-sm font-black font-sans tracking-tight text-zinc-100 uppercase">
              FITQON <span className="text-[#FACC15]">ROOT</span>
            </h3>
            <span className="text-[9px] font-mono uppercase text-zinc-500 font-extrabold tracking-wider block">ADMINISTRATION MATRIX</span>
          </div>
        </div>

        {/* Tab Selection */}
        <nav className="flex flex-col space-y-1.5 font-mono">
          <button
            onClick={() => {
              setActiveTab('overview');
              setSelectedUserHistory(null);
            }}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-left uppercase transition-all flex items-center justify-between group cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#FACC15] text-black font-extrabold shadow-lg shadow-[#FACC15]/5 hover:bg-white animate-pulse-slow'
                : 'text-zinc-400 hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-900/60'
            }`}
          >
            <span>📈 LIVE SYSTEM OVERVIEW</span>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity animate-bounce-right" />
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setSelectedUserHistory(null);
            }}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-left uppercase transition-all flex items-center justify-between group cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#FACC15] text-black font-extrabold shadow-lg shadow-[#FACC15]/5 hover:bg-white'
                : 'text-zinc-400 hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-900/60'
            }`}
          >
            <span>👥 ATHLETE MATRIX MANAGER</span>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => {
              setActiveTab('reports');
              setSelectedUserHistory(null);
            }}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-left uppercase transition-all flex items-center justify-between group cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-[#FACC15] text-black font-extrabold shadow-lg shadow-[#FACC15]/5 hover:bg-white'
                : 'text-zinc-400 hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-900/60'
            }`}
          >
            <span>📊 ARCHIVE EXPORTER</span>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => {
              setActiveTab('feed');
              setSelectedUserHistory(null);
            }}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-left uppercase transition-all flex items-center justify-between group cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-[#FACC15] text-black font-extrabold shadow-lg shadow-[#FACC15]/5 hover:bg-white'
                : 'text-zinc-400 hover:bg-zinc-950 hover:text-white border border-transparent hover:border-zinc-900/60'
            }`}
          >
            <span>⚡ DIAGNOSTIC TELEMETRY</span>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </nav>

        {/* Sync panel indicators */}
        <div className="pt-4 border-t border-zinc-900">
          <button
            onClick={loadAdminMetrics}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-3 border border-zinc-900 rounded-xl bg-zinc-950 font-mono text-[9px] text-zinc-400 hover:text-[#FACC15] hover:border-[#FACC15]/30 hover:bg-black transition-all cursor-pointer font-bold tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
            <span>FORCE METRIC RELINK</span>
          </button>
        </div>
      </div>

      {/* Main SaaS Dashboard Workspace area */}
      <div className="lg:col-span-9 space-y-6 w-full">
        
        {/* VIEW 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
               {/* Row of KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="premium-card p-5 rounded-2xl relative overflow-hidden group hover:border-[#FACC15]/25 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Total Athletes</span>
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <UsersIcon className="w-4 h-4 text-[#FACC15]" />
                  </div>
                </div>
                <p className="text-3xl font-black font-sans text-white tracking-tight">{stats.totalUsers}</p>
                <div className="w-full h-[1px] bg-zinc-900 my-2.5"></div>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">ACTIVE REGISTRY LIFETIME</p>
              </div>

              <div className="premium-card p-5 rounded-2xl relative overflow-hidden group hover:border-[#FACC15]/25 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Daily Check-ins</span>
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <Activity className="w-4 h-4 text-[#FACC15] animate-pulse" />
                  </div>
                </div>
                <p className="text-3xl font-black font-sans text-[#FACC15] tracking-tight glow-text">{stats.checkinsToday}</p>
                <div className="w-full h-[1px] bg-zinc-900 my-2.5"></div>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">SUBMITTED SINCE MIDNIGHT</p>
              </div>

              <div className="premium-card p-5 rounded-2xl relative overflow-hidden group hover:border-[#FACC15]/25 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Average Wellness</span>
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                    <Award className="w-4 h-4 text-[#FACC15]" />
                  </div>
                </div>
                <p className="text-3xl font-black font-sans text-white tracking-tight">{stats.avgRating}</p>
                <div className="w-full h-[1px] bg-zinc-900 my-2.5"></div>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">SYSTEM AVERAGE SCORE</p>
              </div>

              <div className="premium-card p-5 rounded-2xl relative overflow-hidden group hover:border-[#FACC15]/25 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Streak Leader</span>
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-[#FACC15]/10">
                    <Flame className="w-4 h-4 text-[#FACC15]" />
                  </div>
                </div>
                {stats.streakLeaders && stats.streakLeaders.length > 0 ? (
                  <div>
                    <p className="text-lg font-black font-sans text-white truncate tracking-tight">
                      {stats.streakLeaders[0].name}
                    </p>
                    <div className="w-full h-[1px] bg-zinc-900 my-1.5"></div>
                    <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wide">
                      🔥 CURRENT STREAK: <strong className="text-[#FACC15]">{stats.streakLeaders[0].streak} DAYS</strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-black font-sans text-[#FACC15] tracking-tight">N/A</p>
                    <div className="w-full h-[1px] bg-zinc-900 my-2.5"></div>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">NO RECENT STREAKS ACTIVE</p>
                  </div>
                )}
              </div>
            </div>

            {/* RECHARTS GRAPHS BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-4">
              
              {/* Daily Checkins line graph */}
              <div className="md:col-span-12 bg-zinc-950 border border-zinc-900 p-5 rounded-lg min-h-[300px] flex flex-col justify-between">
                <span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
                  DAILY HABIT CHECK-INS over past 30 days
                </span>
                <div className="h-60 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.dailyCheckins}>
                      <XAxis dataKey="date" stroke="#52525b" strokeWidth={1} style={{ fontSize: '10px' }} />
                      <YAxis stroke="#52525b" strokeWidth={1} style={{ fontSize: '10px' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#FACC15"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#000000', stroke: '#FACC15', strokeWidth: 1.5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie rating distribution and common movements bar chart */}
              <div className="md:col-span-5 bg-zinc-950 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between min-h-[280px]">
                <span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
                  RATINGS DISTRIBUTION
                </span>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.ratingDistribution.filter((itm: any) => itm.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.ratingDistribution.map((entry: any, index: number) => {
                          const colors = ['#FACC15', '#FFFFFF', '#71717A', '#3F3F46', '#EF4444', '#1F2937'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap text-[10px] font-mono text-zinc-500 justify-center gap-x-3 gap-y-1">
                  {stats.ratingDistribution.map((entry: any, index: number) => {
                    const bullets = ['🟡', '⚪', '🔘', '⚫', '🔴', '🔹'];
                    return (
                      <span key={index}>
                        {bullets[index % bullets.length]} {entry.name} ({entry.value})
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Most Common exercises bar chart */}
              <div className="md:col-span-7 bg-zinc-950 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between min-h-[280px]">
                <span className="block text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
                  POPULAR COMPLETED EXERCISES LOGS
                </span>
                <div className="h-48 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.commonExercisesCount}>
                      <XAxis dataKey="name" stroke="#52525b" style={{ fontSize: '9px' }} />
                      <YAxis stroke="#52525b" style={{ fontSize: '10px' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FACC15" radius={[2, 2, 0, 0]}>
                        {stats.commonExercisesCount.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#FACC15' : '#FFFFFF'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ATHLETES USER LIST */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            {/* Search and Filters tool row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 premium-card p-4 rounded-xl w-full">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Filter athlete nodes by profile description name or secure email address..."
                  className="w-full bg-zinc-950 border border-zinc-900 pl-10 pr-4 py-3 rounded-lg text-xs placeholder-zinc-600 focus:outline-none focus:border-[#FACC15]/45 font-mono text-zinc-200"
                />
              </div>

              <div className="w-full sm:w-auto shrink-0">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 px-4 py-3 rounded-lg text-xs font-mono text-zinc-400 focus:outline-none focus:border-[#FACC15]/45 cursor-pointer uppercase font-bold tracking-wider"
                >
                  <option value="">-- SORT SYSTEM Wellness --</option>
                  <option value="Excellent">🟢 EXCELLENT</option>
                  <option value="Great">🟡 GREAT</option>
                  <option value="Good">🔵 GOOD</option>
                  <option value="Average">⚪ AVERAGE</option>
                  <option value="Needs Improvement">🔴 NEEDS ATTN</option>
                  <option value="Poor">⚫ POOR</option>
                </select>
              </div>
            </div>

            {/* Split screen: Users List on left, details panels on right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Users table */}
              <div className={`bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden ${selectedUserHistory ? 'md:col-span-6' : 'md:col-span-12'}`}>
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/60 border-b border-zinc-900 text-[10px] font-mono text-zinc-500 uppercase text-left">
                        <th className="p-4 rounded-tl">Athlete Profile Name</th>
                        <th className="p-4">Last Check-In</th>
                        <th className="p-4 text-center">Streak</th>
                        <th className="p-4 text-center">Avg Rating</th>
                        <th className="p-4 rounded-tr text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/40 text-xs">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-10 text-center text-zinc-500 font-mono uppercase">
                            No Athlete logs filter match.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((usr) => (
                          <tr
                            key={usr.id}
                            onClick={() => handleInspectUser(usr.id)}
                            className="hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                          >
                            <td className="p-4 text-left">
                              <span className="font-bold text-zinc-200 group-hover:text-[#FACC15] block">
                                {usr.name}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{usr.email}</span>
                            </td>
                            <td className="p-4 font-mono text-zinc-400">{usr.lastCheckIn}</td>
                            <td className="p-4 text-center font-mono font-bold text-[#FACC15]">🔥 {usr.streak}d</td>
                            <td className="p-4 text-center">
                              <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[9px] px-2 py-0.5 rounded">
                                {usr.averageRating}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="text-[10px] font-mono text-[#FACC15] uppercase font-bold group-hover:underline">
                                Inspect List ➜
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Inspected User detailed logs list panel */}
              {selectedUserHistory && (
                <div className="md:col-span-6 bg-zinc-950 border border-zinc-900 rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-start pb-3 border-b border-zinc-900">
                    <div>
                      <h4 className="font-extrabold text-zinc-200">{selectedUserHistory.user.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-500">{selectedUserHistory.user.email}</p>
                    </div>
                    <button
                      onClick={() => setSelectedUserHistory(null)}
                      className="text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      [CLOSE]
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {selectedUserHistory.history.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-10 font-mono">
                        NO LOGS ASSOCIATED WITH ATHLETE YET.
                      </p>
                    ) : (
                      selectedUserHistory.history.map((log: any, hIdx: number) => (
                        <div
                          key={hIdx}
                          className="bg-zinc-900/30 border border-zinc-900 p-3.5 rounded space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-[#FACC15] font-bold">{log.date}</span>
                            <span className="bg-[#FACC15] text-black font-extrabold px-1.5 py-0.5 rounded uppercase">
                              {log.report.rating}
                            </span>
                          </div>
                          
                          <p className="text-zinc-400 leading-normal line-clamp-2 italic">
                            "{log.report.verdict}"
                          </p>

                          <div className="border-t border-zinc-900 pt-2 flex flex-col space-y-1 text-[10px] font-mono text-zinc-500">
                            {log.workout && (
                              <span>🏋️ Workout: {log.workout.duration} mins ({log.workout.intensity})</span>
                            )}
                            {log.diet && (
                              <span>🍽️ Diet: {log.diet.totalCalories} kcal, avoided: {log.diet.avoided.join(', ') || 'none'}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: COMPILE AND EXPORT REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="premium-card p-6 sm:p-8 rounded-2xl text-left max-w-2xl mx-auto space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FACC15]"></div>
              
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-900">
                <div className="p-2 bg-[#FACC15]/10 rounded-xl border border-[#FACC15]/20">
                  <Download className="w-5 h-5 text-[#FACC15]" />
                </div>
                <div>
                  <h4 className="text-sm font-black font-sans uppercase tracking-tight text-white">
                    SYSTEM ANALYTICS EXPORT
                  </h4>
                  <p className="text-[9px] font-mono uppercase text-zinc-500 font-extrabold tracking-wider">FITQON DATA COMPILATION PIPELINE</p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-mono">
                Initialize manual audit queries by selecting evaluation date boundaries. The server will consolidate athlete streak configurations, workout habits, and diet tags into standard document shapes.
              </p>

              <div className="grid grid-cols-2 gap-4 font-mono">
                <div>
                  <label className="block text-[9px] tracking-widest uppercase text-zinc-500 mb-2 font-black">
                    STARTING BOUNDARY
                  </label>
                  <input
                    type="date"
                    value={reportStart}
                    onChange={(e) => setReportStart(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-xs text-[#FACC15] focus:outline-none focus:border-[#FACC15]/45 cursor-pointer font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] tracking-widest uppercase text-zinc-500 mb-2 font-black">
                    CEILING BOUNDARY
                  </label>
                  <input
                    type="date"
                    value={reportEnd}
                    onChange={(e) => setReportEnd(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 p-3 rounded-xl text-xs text-[#FACC15] focus:outline-none focus:border-[#FACC15]/45 cursor-pointer font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 bg-zinc-950 border border-zinc-900 rounded-xl p-1 mb-2 font-mono">
                <button
                  type="button"
                  onClick={() => setReportFormat('csv')}
                  className={`py-3 text-[10px] font-bold rounded-lg uppercase cursor-pointer transition-all ${
                    reportFormat === 'csv'
                      ? 'bg-[#FACC15] text-black font-extrabold shadow-md'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Comma Separated CSV
                </button>
                <button
                  type="button"
                  onClick={() => setReportFormat('json')}
                  className={`py-3 text-[10px] font-bold rounded-lg uppercase cursor-pointer transition-all ${
                    reportFormat === 'json'
                      ? 'bg-[#FACC15] text-black font-extrabold shadow-md'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  Raw REST JSON shape
                </button>
              </div>

              <button
                onClick={handleDownloadReport}
                className="w-full bg-[#FACC15] text-black font-mono font-black py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-white active:scale-95 transition-all text-center flex items-center justify-center gap-2 glow-btn cursor-pointer"
              >
                <Download className="w-4 h-4 fill-current" /> COMPILE & EXPORT DATA STREAM
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: LIVE COMPLETED HEALTH FEED */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2">
              <span className="text-xs font-mono text-zinc-505 uppercase text-zinc-500">
                Today's real-time anonymized submissions list
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="space-y-4">
              {liveFeed.length === 0 ? (
                <div className="py-20 border border-[#FACC15]/10 bg-zinc-950/20 text-center rounded-lg">
                  <Terminal className="w-8 h-8 text-zinc-650 text-zinc-650 mx-auto mb-3 text-zinc-600" />
                  <p className="text-xs font-mono uppercase text-zinc-500">Activity monitor queue empty</p>
                </div>
              ) : (
                liveFeed.map((report, idx) => (
                  <motion.div
                    key={report.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="premium-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group hover:border-[#FACC15]/25 transition-all text-left text-zinc-100"
                  >
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#FACC15] shrink-0"></div>
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                        <span className="font-extrabold text-[#FACC15] tracking-widest">// DECK_SIGNAL: #{String(report.id || idx).substring(0, 8).toUpperCase()}</span>
                        <span className="text-zinc-400 font-bold">{report.date}</span>
                        {report.workoutType && (
                          <span className="bg-zinc-950 text-zinc-400 py-0.5 px-2.5 rounded-lg border border-zinc-900 uppercase font-black text-[9px] tracking-wider">
                            🔧 {report.workoutType} ({report.duration}M)
                          </span>
                        )}
                      </div>

                      <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed p-1">
                        "{report.verdict}"
                      </p>

                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">
                        Validated node identity: <span className="text-zinc-300 font-bold">{report.userName}</span> ({report.userEmail})
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center md:flex-col gap-2 relative">
                      <span className="bg-[#FACC15] text-black text-[10px] font-mono font-black py-1 px-3 rounded-lg uppercase border border-[#FACC15] shadow-lg shadow-[#FACC15]/5">
                        {report.rating}
                      </span>
                      <span className="bg-zinc-950 text-zinc-500 text-[9px] font-mono px-2 py-1 rounded-lg border border-zinc-900 uppercase font-bold tracking-wider">
                        {report.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
