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
  ArrowRight
} from 'lucide-react';
import { CostChart } from './CostChart';
import { PromptTester } from './PromptTester';
import { Analytics } from './Analytics';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { useCurrency, CURRENCIES, CurrencyKey } from '../lib/CurrencyContext';
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

  const totalPossibleCost = sessionStats.totalSpent + sessionStats.costSaved;
  const tokenReduction = (sessionStats.requests > 0 && totalPossibleCost > 0)
    ? Math.round((sessionStats.costSaved / totalPossibleCost) * 100) 
    : 0;

  const stats = [
    { label: 'Total Spent', value: formatCost(sessionStats.totalSpent), change: 'Cloud', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Tokens Used', value: sessionStats.tokensUsed.toLocaleString(), change: 'Cloud', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Requests', value: sessionStats.requests.toLocaleString(), change: 'Cloud', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Cost Saved', value: formatCost(sessionStats.costSaved), change: 'Cloud', icon: Sparkles, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">OptiPrompt</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'playground', label: 'Playground', icon: TestTube2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pr-3 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100 transition-all active:scale-95"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <span className="text-xs font-bold text-gray-700 hidden sm:block">{user?.displayName?.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[100]"
                  >
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/settings')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <SettingsIcon className="w-4 h-4" /> Settings
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowResetConfirm(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Clear History
                    </button>

                    <div className="h-px bg-gray-50 my-2" />

                    <button 
                      onClick={() => logout()}
                      className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Clear History?</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">This will permanently delete all your optimization history from the cloud. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={resetStats}
                  className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest", 
                      stat.change === 'Cloud' ? "bg-indigo-50 text-indigo-600" : "bg-gray-50 text-gray-600"
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CostChart history={history} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">Optimization Efficiency</h3>
                  <div className="space-y-6">
                    {[
                      { label: 'Token Reduction', value: tokenReduction, color: 'bg-indigo-600' },
                      { label: 'Cost Savings', value: tokenReduction > 0 ? Math.round(tokenReduction * 0.8) : 0, color: 'bg-green-600' },
                      { label: 'Latency Improvement', value: tokenReduction > 0 ? Math.round(tokenReduction * 0.5) : 0, color: 'bg-amber-600' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">{item.label}</span>
                          <span className="text-gray-900 font-bold">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={cn("h-full rounded-full", item.color)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-50">
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="w-full py-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    View Detailed Report <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Tester Preview */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Prompt Playground</h2>
                  <p className="text-gray-500 mt-1">Test and optimize your prompts in real-time.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('playground')}
                  className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                >
                  Open Full Playground
                </button>
              </div>
              <PromptTester 
                onOptimize={handleOptimize} 
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'playground' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm space-y-10"
          >
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-gray-900">Prompt Playground</h2>
              <p className="text-lg text-gray-500 mt-2">
                Experiment with different optimization modes. Cheap mode uses LLM-based compression for maximum token savings, while Quality mode focuses on structural improvements.
              </p>
            </div>
            <PromptTester 
              onOptimize={handleOptimize} 
            />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-lg text-gray-500 mt-2">
                Deep dive into your AI usage patterns, model distribution, and cost savings metrics.
              </p>
            </div>
            <Analytics 
              stats={sessionStats} 
              history={history}
            />
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>© 2026 OptiPrompt. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-8">
          <Link to="/docs" className="hover:text-gray-600 transition-colors">Documentation</Link>
          <Link to="/api-ref" className="hover:text-gray-600 transition-colors">API Reference</Link>
          <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
