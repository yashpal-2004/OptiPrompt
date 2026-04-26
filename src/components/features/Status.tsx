import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Status() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f2ee] selection:bg-red-light selection:text-white relative overflow-hidden">
      <div className="grid-bg-overlay" />
      
      <nav className="sticky top-0 z-50 bg-[#f3f2ee]/80 backdrop-blur-xl border-b border-black/5 px-6">
        <div className="max-w-4xl mx-auto h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-black/40 hover:text-black transition-all font-black text-[10px] uppercase tracking-[2px] border-none bg-transparent cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back
          </button>
          
          <div className="flex flex-col items-center">
             <h1 className="text-xs font-black text-black uppercase tracking-[4px] mb-0.5">System Status</h1>
             <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest">Real-time Diagnostics</p>
          </div>

          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 space-y-20 relative z-10">
        <header className="space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-[3px] mb-4"
          >
            Live Feed Active
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-black uppercase tracking-tighter text-black"
          >
            Neural <span className="text-red">Health</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-black/50 font-bold uppercase tracking-widest max-w-lg mx-auto leading-relaxed"
          >
            Monitoring real-time telemetry from OptiPrompt core services and synchronized LLM architectures.
          </motion.p>
        </header>

        <section className="bg-white p-12 shadow-2xl border-l-[6px] border-black space-y-12">
          <div className="flex items-center justify-between p-8 bg-[#f3f2ee] border border-black/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-emerald-500 text-white flex items-center justify-center rounded-2xl shadow-xl shadow-emerald-100 animate-pulse">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-black uppercase tracking-widest text-xl">Operational</p>
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">Global Node Status: Optimal</p>
              </div>
            </div>
            <div className="text-right relative z-10 hidden sm:block">
              <p className="text-[10px] font-black text-black/20 uppercase tracking-[2px]">Last Sync</p>
              <p className="text-xs font-bold text-black mt-1 uppercase">Just Now</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-black/40 uppercase tracking-[4px] mb-6">Service Telemetry</h3>
            {['Frontend Dashboard', 'Optimization Engine', 'Groq API Connectivity', 'Neural Cache Layer'].map((service, i) => (
              <motion.div 
                key={service} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-black/5 last:border-0 gap-4 group hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">0{i + 1}</span>
                  <p className="font-bold text-black uppercase tracking-widest text-xs">{service}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[2px]">Sync Locked</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-black/5 flex justify-between items-center opacity-40">
        <div className="text-[10px] font-black uppercase tracking-widest">OptiPrompt Diagnostics Unit</div>
        <div className="text-[10px] font-bold uppercase tracking-widest">System Time: {new Date().toLocaleTimeString()}</div>
      </footer>
    </div>
  );
}
