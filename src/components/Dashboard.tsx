import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Zap, 
  Sparkles, 
  LayoutDashboard, 
  BarChart3, 
  TestTube2, 
  User, 
  Globe, 
  LogOut, 
  Settings as SettingsIcon, 
  ChevronDown,
  History,
  AlertCircle,
  Trash2,
  ArrowRight,
  Key
} from 'lucide-react';
import { CostChart } from './CostChart';
import { PromptTester } from './PromptTester';
import { Analytics } from './Analytics';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { useCurrency, CURRENCIES, CurrencyKey } from '../lib/CurrencyContext';
import { useKeys } from '../lib/KeyContext';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

interface UsageLog {
  id: string;
  uid: string;
  originalPrompt: string;
  optimizedPrompt: string;
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  optimizedCost: number;
  costSaved: number;
  mode: string;
  model: string;
  timestamp: string;
}

export function Dashboard() {
  const { user, logout, userProfile } = useAuth();
  const { currency, setCurrency, formatCost } = useCurrency();
  const { keys } = useKeys();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'analytics' | 'playground'>('dashboard');
  const [sessionStats, setSessionStats] = React.useState({
    totalSpent: 0,
    tokensUsed: 0,
    requests: 0,
    costSaved: 0
  });
  const [history, setHistory] = React.useState<UsageLog[]>([]);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Fetch history and stats from Firestore
  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'usageLogs'),
      where('uid', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as any)?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as UsageLog[];
      setHistory(logs);

      // Calculate stats from logs
      const stats = logs.reduce((acc, log) => ({
        totalSpent: acc.totalSpent + (log.optimizedCost || 0),
        tokensUsed: acc.tokensUsed + (log.optimizedTokens || 0),
        requests: acc.requests + 1,
        costSaved: acc.costSaved + (log.costSaved || 0)
      }), { totalSpent: 0, tokensUsed: 0, requests: 0, costSaved: 0 });

      setSessionStats(stats);
    }, (error) => {
      console.error("Error fetching logs:", error);
      toast.error("Failed to sync data with cloud");
    });

    return () => unsubscribe();
  }, [user]);

  const resetStats = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'usageLogs'), where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      setShowResetConfirm(false);
      toast.success("History cleared successfully");
    } catch (error) {
      console.error("Error resetting stats:", error);
      toast.error("Failed to clear history");
    }
  };

  const handleOptimize = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'usageLogs'), {
        uid: user.uid,
        originalPrompt: data.originalPrompt,
        optimizedPrompt: data.optimizedPrompt,
        originalTokens: data.originalTokens || 0,
        optimizedTokens: data.optimizedTokens || 0,
        tokensSaved: data.tokensSaved || 0,
        optimizedCost: data.optimizedCost || 0,
        costSaved: data.costSaved || 0,
        mode: data.mode,
        model: data.model,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("Failed to save optimization to cloud");
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const totalPossibleCost = sessionStats.totalSpent + sessionStats.costSaved;
  const tokenReduction = (sessionStats.requests > 0 && totalPossibleCost > 0)
    ? Math.round((sessionStats.costSaved / totalPossibleCost) * 100) 
    : 0;

  const stats = [
    { label: 'Total Saved', value: formatCost(sessionStats.costSaved), change: 'Total', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'API Spend', value: formatCost(sessionStats.totalSpent), change: 'Billed', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Requests', value: sessionStats.requests.toLocaleString(), change: 'Total', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Tokens', value: sessionStats.tokensUsed.toLocaleString(), change: 'Used', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="min-h-screen grid-bg transition-colors duration-500">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 px-6 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200 relative overflow-hidden group-hover:scale-105 transition-all active:scale-95">
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-white/10" />
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-black font-display tracking-tight text-slate-900 block leading-tight">OptiPrompt</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intelligence Engine</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200/50">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'playground', label: 'Playground', icon: TestTube2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-2.5 text-sm font-bold rounded-xl transition-all relative group",
                  activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-md transform -translate-y-px" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <tab.icon className={cn("w-4 h-4 transition-colors", activeTab === tab.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 pr-4 glass-dark rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-xl border-t-white/10"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden border border-white/20">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-tighter leading-none">Authorized</p>
                  <p className="text-xs font-bold text-white mt-1">{user?.displayName?.split(' ')[0]}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-64 glass rounded-3xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] border border-slate-200 p-2 z-50 overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Profiling</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                      </div>

                      <div className="p-3 mb-2 bg-slate-50 rounded-2xl mx-1">
                        <div className="flex items-center justify-between mb-3 px-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</p>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">HEALTHY</span>
                        </div>
                        <div className="flex gap-2 px-2">
                          {keys.length > 0 ? keys.map(k => (
                            <div 
                              key={k.id} 
                              className={cn(
                                "w-1.5 h-6 rounded-full transition-all duration-500 shadow-sm",
                                k.status === 'active' ? "bg-emerald-500 shadow-emerald-200" :
                                k.status === 'quota_exceeded' ? "bg-amber-500 shadow-amber-200" :
                                k.status === 'invalid' ? "bg-rose-500 shadow-rose-200" : "bg-slate-300"
                              )}
                              title={`${k.id}: ${k.status}`}
                            />
                          )) : (
                            <p className="text-[10px] text-slate-400 font-medium italic">No active nodes detected</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <button 
                          onClick={() => navigate('/settings')}
                          className="w-full px-4 py-3 text-left text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-all group"
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <SettingsIcon className="w-4 h-4 text-slate-500" />
                          </div>
                          Account Settings
                        </button>
                        
                        <button 
                          onClick={() => {
                            setShowResetConfirm(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-3 transition-all group"
                        >
                          <div className="w-8 h-8 bg-rose-100/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </div>
                          Purge Logs
                        </button>

                        <div className="h-px bg-slate-100 mx-4 my-2" />

                        <button 
                          onClick={() => logout()}
                          className="w-full px-4 py-3 text-left text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-all group"
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform text-slate-400">
                            <LogOut className="w-4 h-4" />
                          </div>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm glass rounded-[3rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border-white/20"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-8 mx-auto animate-float">
                <AlertCircle className="w-10 h-10 text-rose-600" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-3 text-center font-display">Confirm Purge</h3>
              <p className="text-slate-500 mb-10 text-center leading-relaxed font-medium">This will permanently delete all optimization history from the global cloud storage.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                >
                  ABORT
                </button>
                <button 
                  onClick={resetStats}
                  className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-2xl shadow-rose-200 transition-all active:scale-95"
                >
                  PURGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-5xl font-black font-display tracking-tight text-slate-900"
                  >
                    {getTimeBasedGreeting()}, <span className="text-indigo-600">{user?.displayName?.split(' ')[0] || 'Explorer'}</span>.
                  </motion.h2>
                  <p className="text-lg text-slate-500 font-medium max-w-xl">
                    Your optimization engine is running at <span className="text-indigo-600 font-bold">{tokenReduction}% efficiency</span> across all active AI nodes.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-1.5 glass rounded-2xl border-slate-200 shadow-sm self-start md:self-auto">
                   <div className="flex -space-x-2">
                     {[...Array(3)].map((_, i) => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                         <img src={`https://i.pravatar.cc/100?u=user${i + 1}`} alt="Avatar" />
                       </div>
                     ))}
                   </div>
                   <div className="pr-3 pl-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Live Insights</p>
                     <p className="text-xs font-bold text-slate-700 mt-1">1.2k Prompts Processed</p>
                   </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="glass p-8 rounded-[2rem] border-slate-200 relative overflow-hidden group hover:border-indigo-200 transition-all duration-300 shadow-2xl shadow-slate-200/50"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all">
                      <stat.icon className="w-32 h-32" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-8">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform", stat.bg)}>
                        <stat.icon className={cn("w-7 h-7", stat.color)} />
                      </div>
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {stat.change}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                      <h4 className="text-4xl font-black font-display text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                        {stat.value}
                      </h4>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 group">
                  <div className="glass p-10 rounded-[3rem] border-slate-200 hover:border-indigo-100 transition-all shadow-[0_40px_80px_-40px_rgba(0,0,0,0.1)] h-full">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 font-display">Financial Trajectory</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">Cost savings analytics across all compute regions.</p>
                      </div>
                      <button 
                        onClick={() => { setActiveTab('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="px-4 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-50 rounded-xl border border-indigo-100 transition-all"
                      >
                        FULL REPORT
                      </button>
                    </div>
                    <CostChart history={history} />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="glass p-10 rounded-[3rem] border-slate-200 flex flex-col justify-between shadow-[0_40px_80px_-40px_rgba(0,0,0,0.1)] h-full overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                          <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 font-display">Node Efficiency</h3>
                      </div>
                      
                      <div className="space-y-8">
                        {[
                          { label: 'Token Reduction', value: tokenReduction, color: 'bg-indigo-600', sub: 'Compressed logic' },
                          { label: 'Cost Salvage', value: tokenReduction > 0 ? Math.round(tokenReduction * 0.8) : 0, color: 'bg-emerald-600', sub: 'Saved capital' },
                          { label: 'Latency Boost', value: tokenReduction > 0 ? Math.round(tokenReduction * 0.5) : 0, color: 'bg-amber-500', sub: 'Reduced TTFT' },
                        ].map((item, i) => (
                          <div key={item.label} className="space-y-3">
                            <div className="flex justify-between items-end">
                              <div>
                                <span className="text-sm font-black text-slate-800 block">{item.label}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</span>
                              </div>
                              <span className="text-xl font-black text-indigo-600 font-display">{item.value}%</span>
                            </div>
                            <div className="h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 1.5, delay: 0.5 + (i * 0.2), ease: "easeOut" }}
                                className={cn("h-full rounded-full shadow-lg", item.color)} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-12 group/btn relative z-10">
                      <button 
                        onClick={() => setActiveTab('analytics')}
                        className="w-full py-5 bg-slate-900 hover:bg-indigo-700 text-white font-black rounded-3xl transition-all shadow-2xl flex items-center justify-center gap-3 overflow-hidden group/text active:scale-95"
                      >
                         <span className="relative z-10">Enhanced Analytics</span>
                         <ArrowRight className="w-4 h-4 relative z-10 group-hover/text:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompt Playground Inline */}
              <div className="glass p-12 rounded-[4rem] border-slate-200 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[100px] -mr-64 -mt-64 group-hover:translate-x-10 transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="space-y-2">
                       <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest mb-2">
                         <Sparkles className="w-3.5 h-3.5 fill-current" />
                         Next-Gen Engine
                       </div>
                      <h2 className="text-4xl font-black text-slate-900 font-display">Optimizer Playground</h2>
                      <p className="text-slate-500 font-medium max-w-xl">Deep-compress your prompts using our cloud-native LLM engine. Switch between Quality and Extreme modes to balance cost and performance.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('playground')}
                      className="px-10 py-5 glass border-slate-200 text-indigo-600 font-black rounded-3xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl group/btn"
                    >
                      <span className="flex items-center gap-3 font-display text-lg">
                        FULL SCREEN
                        <ChevronDown className="w-5 h-5 -rotate-90 group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] z-10 rounded-3xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setActiveTab('playground')}
                        className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce"
                      >
                       <TestTube2 className="w-5 h-5 text-indigo-600" />
                       Activate Playground Engine
                      </button>
                    </div>
                    <div className="pointer-events-none opacity-40 blur-[2px] transition-all transform group-hover:blur-0 group-hover:opacity-100 group-hover:pointer-events-auto scale-[0.99] group-hover:scale-100 duration-500">
                      <PromptTester onOptimize={handleOptimize} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'playground' && (
            <motion.div
              key="playground"
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 30 }}
              className="glass p-16 rounded-[4rem] border-slate-200 shadow-2xl space-y-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] -mr-80 -mt-80" />
              
              <div className="relative z-10 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6">
                  <Activity className="w-3.5 h-3.5" />
                  Realtime Feedback
                </div>
                <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-tight">Optimization Laboratory</h2>
                <p className="text-xl text-slate-500 mt-6 font-medium leading-relaxed">
                  Experiment with tiered optimization modes. <span className="text-indigo-600 font-extrabold uppercase">Cheap mode</span> implements radical token reduction via LLM compression, while <span className="text-emerald-600 font-extrabold uppercase">Quality mode</span> ensures maximum semantic preservation.
                </p>
              </div>
              <div className="relative z-10">
                <PromptTester onOptimize={handleOptimize} />
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 max-w-5xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest mb-6">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Data Integration
                  </div>
                  <h2 className="text-6xl font-black text-slate-900 font-display tracking-tight leading-tight">Compute Analytics</h2>
                  <p className="text-xl text-slate-500 mt-6 font-medium leading-relaxed">
                    Granular visualization of your AI resource consumption, model distribution patterns, and financial efficiency across distributed nodes.
                  </p>
                </div>
              </div>
              <Analytics 
                stats={sessionStats} 
                history={history}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Improved Footer */}
      <footer className="mt-20 border-t border-slate-200/50 bg-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20" />
        
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-20">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black font-display text-slate-900">OptiPrompt</span>
              </div>
              <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                The leading edge of prompt engineering and optimization. Built to minimize cost and maximize the potential of modern large language models.
              </p>
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-600">
                    <div className="w-5 h-5 bg-current" style={{ WebkitMaskImage: `url('https://cdn.simpleicons.org/${['github', 'x', 'linkedin', 'discord'][i]}')`, WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="space-y-6">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Engine</h5>
              <ul className="space-y-4">
                <li><button onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Dashboard</button></li>
                <li><button onClick={() => { setActiveTab('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Analytics</button></li>
                <li><button onClick={() => { setActiveTab('playground'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Playground</button></li>
                <li><Link to="/settings" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Configuration</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Resources</h5>
              <ul className="space-y-4">
                <li><Link to="/docs" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Documentation</Link></li>
                <li><Link to="/api-ref" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Standard API</Link></li>
                <li><a href="https://v0.dev" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Model Registry</a></li>
                <li><Link to="/safety" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Safety Guides</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Support</h5>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Terms of Use</Link></li>
                <li><Link to="/status" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Node Status</Link></li>
                <li><a href="mailto:support@optiprompt.ai" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Node Network Online</span>
            </div>
            
            <div className="flex items-center gap-6">
               <span className="text-xs font-bold text-slate-400">© 2026 OptiPrompt Systems Inc.</span>
               <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                 <Globe className="w-3.5 h-3.5 text-slate-400" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">US (West)</span>
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );

}
