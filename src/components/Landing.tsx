import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { Zap, Mail, Lock, ArrowRight, Chrome, Sparkles, ShieldCheck, TrendingUp, DollarSign, Activity, Globe, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export function Landing() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Successfully signed in!');
    } catch (error: any) {
      toast.error('Failed to sign in', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">OptiPrompt</span>
          </div>
          <button 
            onClick={handleGoogleSignIn}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Optimize your AI budget
          </div>
          <h1 className="text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
            Reduce your AI costs by up to <span className="text-indigo-600">80%</span> without losing quality.
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
            The ultimate toolkit for developers and businesses to monitor, optimize, and scale their AI usage with precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleGoogleSignIn}
              className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
            >
              Start Optimizing Free <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/docs')}
              className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              View Documentation
            </button>
          </div>
          <div className="flex items-center gap-6 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/40/40`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">Joined by 2,000+ developers</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-indigo-600/5 rounded-[3rem] blur-3xl" />
          <div className="relative bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Real-time Savings</p>
                  <p className="text-lg font-bold text-gray-900">₹1,04,240.50 saved</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                +84% Efficiency
              </div>
            </div>
            <div className="h-48 bg-gray-50 rounded-2xl border border-gray-100 flex items-end justify-between p-6 gap-2">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="w-full bg-indigo-600/20 rounded-t-lg relative group"
                >
                  <div className="absolute inset-0 bg-indigo-600 rounded-t-lg scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tokens Used</p>
                <p className="text-xl font-bold text-gray-900">1.2M</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Avg. Latency</p>
                <p className="text-xl font-bold text-gray-900">0.8s</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-32 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Three Modes of Optimization</h2>
            <p className="text-lg text-gray-500">Choose the right balance between cost and quality for your specific use case.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: DollarSign, title: 'CHEAP Mode', desc: 'Optimized for minimal cost. Uses aggressive compression and removes all redundancy while maintaining core meaning. Best for high-volume, low-criticality tasks.' },
              { icon: Sparkles, title: 'QUALITY Mode', desc: 'Balanced optimization. Focuses on structural improvements, clarity, and fixing grammatical errors to ensure high-end output quality. Ideal for customer-facing content.' },
              { icon: Zap, title: 'EXTREME Mode', desc: 'Maximum innovation. Uses experimental refactoring techniques for the highest level of efficiency and standout performance. Perfect for complex logic and technical prompts.' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all">
                  <feature.icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Ready to stop overpaying for AI? Join the future of efficient LLM usage.
          </h2>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto">
            Get started for free today. No credit card required. Cloud sync included by default.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={handleGoogleSignIn}
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Chrome className="w-5 h-5" /> Continue with Google
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            {['No credit card', 'Cancel anytime', 'Free for individuals'].map((text) => (
              <div key={text} className="flex items-center gap-2 text-indigo-100 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-100 flex flex-col items-center justify-between gap-6 text-sm text-gray-400 sm:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>© 2026 OptiPrompt. All rights reserved.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-end">
          <Link to="/docs" className="hover:text-gray-600 transition-colors">Documentation</Link>
          <Link to="/api-ref" className="hover:text-gray-600 transition-colors">API</Link>
          <Link to="/safety" className="hover:text-gray-600 transition-colors">Safety</Link>
          <Link to="/privacy" className="hover:text-gray-600 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-gray-600 transition-colors">Terms</Link>
          <Link to="/status" className="hover:text-gray-600 transition-colors">Status</Link>
        </div>
      </footer>
    </div>
  );
}
