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
import { CostChart } from '../features/CostChart';
import { PromptTester } from '../features/PromptTester';
import { Analytics } from '../features/Analytics';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';
import { useCurrency, CURRENCIES, CurrencyKey } from '../../lib/CurrencyContext';
import { useKeys } from '../../lib/KeyContext';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../firebase';
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
  const [activeTab, setActiveTab] = React.useState<'playground' | 'analytics' | 'history'>('playground');
  const [history, setHistory] = React.useState<UsageLog[]>([]);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Scroll to top when active tab changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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
    }, () => {
      toast.error("Failed to sync data with cloud");
    });

    return () => unsubscribe();
  }, [user]);

  // Derived stats for real-time reactivity
  const sessionStats = React.useMemo(() => {
    return history.reduce((acc, log) => ({
      totalSpent: acc.totalSpent + (log.optimizedCost || 0),
      tokensUsed: acc.tokensUsed + (log.optimizedTokens || 0),
      requests: acc.requests + 1,
      costSaved: acc.costSaved + (log.costSaved || 0)
    }), { totalSpent: 0, tokensUsed: 0, requests: 0, costSaved: 0 });
  }, [history]);

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
    } catch {
      // silent fail
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
    } catch {
      // silent fail
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
    <div className="min-h-screen grid-bg selection:bg-indigo-100 italic-none flex flex-col">
      {/* Navbar - Unified & Clean */}
      <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 px-6 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-20 flex items-center">
          {/* Brand Area */}
          <div className="flex items-center gap-4 group cursor-pointer shrink-0" onClick={() => setActiveTab('playground')}>
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img 
                src="/logo.png" 
                alt="OptiPrompt Logo"
                className="w-full h-full object-cover scale-150"
                onMouseDown={(e) => e.preventDefault()}
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold font-display tracking-tight text-slate-900 block leading-tight">OptiPrompt</span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-1">V1.0 Neural</span>
            </div>
          </div>

          {/* Tab Selection Hub - Centered with Flex */}
          <div className="flex-1 flex justify-center">
            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 backdrop-blur-sm">
              {[
                { id: 'playground', label: 'Laboratory', icon: TestTube2 },
                { id: 'analytics', label: 'Performance', icon: Activity },
                { id: 'history', label: 'Activity', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-2.5 text-[12px] font-bold rounded-lg transition-all relative group overflow-hidden",
                    activeTab === tab.id ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="nav-pill-v4"
                      className="absolute inset-0 bg-white shadow-sm ring-1 ring-slate-200/20 z-0"
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-indigo-600" : "text-slate-400")} />
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile Bottom Tabs Hint - or compact centered icon tabs */}
            <div className="flex md:hidden items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
              {[
                { id: 'playground', icon: TestTube2 },
                { id: 'analytics', icon: Activity },
                { id: 'history', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "p-2.5 rounded-lg transition-all",
                    activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* User & Config Area */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div 
              onClick={() => navigate('/settings')}
              className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all cursor-pointer hover:bg-white hover:shadow-sm"
            >
               <SettingsIcon className="w-4 h-4" />
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center overflow-hidden border border-indigo-100 shadow-inner">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <div className="text-left hidden lg:block pr-2">
                  <p className="text-[11px] font-bold text-slate-800 leading-none">{user?.displayName?.split(' ')[0]}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-80 glass rounded-[2.5rem] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5)] border border-slate-200/50 p-4 z-50 overflow-hidden"
                    >
                      {/* Identity Header */}
                      <div className="px-6 py-6 bg-slate-50/80 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center mb-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-xl mb-4 p-1">
                           <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center">
                             {user?.photoURL ? (
                               <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                             ) : (
                               <User className="w-6 h-6 text-indigo-600" />
                             )}
                           </div>
                        </div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[3px] mb-1">Neural Identity</span>
                        <h4 className="text-base font-bold text-slate-900 leading-tight truncate w-full">{user?.displayName || 'Authorized User'}</h4>
                        <p className="text-[11px] font-medium text-slate-500 mt-1 truncate w-full">{user?.email}</p>
                      </div>

                      {/* Hardware/Node Health Section */}
                      <div className="px-5 py-5 bg-white rounded-[2rem] border border-slate-100 mb-4 shadow-sm hover:border-indigo-100 transition-colors">
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compute Health</p>
                            <div className="flex items-center gap-1.5 mt-1">
                               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                               <span className="text-[11px] font-bold text-emerald-600 uppercase">Operational</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                             <Activity className="w-5 h-5 text-emerald-600" />
                          </div>
                        </div>

                        <div className="flex gap-2 px-1">
                          {keys.map((k, i) => (
                             <div 
                               key={k.id}
                               className={cn(
                                 "w-6 h-6 rounded-md transition-all duration-700",
                                 k.status === 'active' ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : 
                                 k.status === 'quota_exceeded' ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]" :
                                 k.status === 'invalid' ? "bg-rose-500" : "bg-slate-200"
                               )}
                               title={`${k.name}: ${k.status}`}
                             />
                          ))}
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4 text-center">Active Node Mapping</p>
                      </div>

                      {/* Navigation Actions */}
                      <div className="space-y-1">
                        <button 
                          onClick={() => logout()}
                          className="w-full px-5 py-4 text-left rounded-2xl hover:bg-slate-50 transition-all group flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-slate-600">
                               <LogOut className="w-4 h-4" />
                            </div>
                            <span className="text-[13px] font-bold text-slate-500 group-hover:text-slate-900">Sign Out</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
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

      <main className="max-w-7xl mx-auto px-6 py-12 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'playground' && (
            <motion.div
              key="laboratory"
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="py-12 relative overflow-visible"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100/50 text-indigo-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-indigo-200/50 backdrop-blur-sm">
                    <Activity className="w-3.5 h-3.5" />
                    Neural optimization engine
                  </div>
                  <div className="h-4 w-px bg-slate-200" />
                  <h2 className="text-2xl font-medium text-slate-800 font-display tracking-tight">Optimization Laboratory</h2>
                </div>
                <p className="text-sm text-slate-500 font-medium">Experiment with tiered neural compression modes.</p>
              </div>
              <div className="relative z-10">
                <PromptTester onOptimize={handleOptimize} />
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12 py-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                   <h1 className="text-5xl font-medium text-slate-900 font-display tracking-tight leading-none">System performance</h1>
                   <p className="text-slate-600 font-medium mt-2">Cross-platform metrics and financial efficiency overview.</p>
                </div>
                <div className="flex items-center gap-3 p-1.5 glass rounded-2xl border-slate-200">
                    <div className="pr-3 pl-3">
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">session health</p>
                      <p className="text-xs font-bold text-emerald-600 mt-1 uppercase">Operational</p>
                    </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card p-6 border-slate-200/40 group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{stat.change}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">{stat.label}</p>
                      <h4 className="text-3xl font-medium text-slate-900 font-display">{stat.value}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Analytics 
                stats={sessionStats} 
                history={history}
                view="charts"
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12 py-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
                <div>
                   <h1 className="text-5xl font-medium text-slate-900 font-display tracking-tight leading-none">Activity ledger</h1>
                   <p className="text-slate-600 font-medium mt-2">Comprehensive historical logs of neural optimizations.</p>
                </div>
              </div>
              <Analytics 
                stats={sessionStats} 
                history={history}
                view="ledger"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-slate-200 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="OptiPrompt Logo"
                  className="w-full h-full object-cover scale-150"
                />
              </div>
              <span className="text-lg font-medium font-display text-slate-800">OptiPrompt</span>
              <span className="text-[10px] font-medium text-slate-400 border-l border-slate-200 pl-3">© 2026 Neural Systems</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-end">
                <Link to="/docs" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Documentation</Link>
                <Link to="/api-ref" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">API</Link>
                <Link to="/safety" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Safety</Link>
                <Link to="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</Link>
                <Link to="/terms" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Terms</Link>
                <Link to="/status" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Status</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
