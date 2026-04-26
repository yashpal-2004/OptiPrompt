import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export function TermsOfUse() {
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
             <h1 className="text-xs font-black text-black uppercase tracking-[4px] mb-0.5">Terms of Use</h1>
             <p className="text-[9px] font-bold text-black/40 uppercase tracking-widest">Protocol Agreement</p>
          </div>

          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 space-y-20 relative z-10">
        <header className="space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-[3px] mb-4"
          >
            Access Authorization
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-black uppercase tracking-tighter text-black"
          >
            Service <span className="text-red">Protocol</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-black/50 font-bold uppercase tracking-widest max-w-lg mx-auto leading-relaxed"
          >
            Please review the following terms carefully before initializing your neural optimization sessions.
          </motion.p>
        </header>

        <section className="bg-white p-12 shadow-2xl border-l-[6px] border-red space-y-12">
          <div className="space-y-12 text-black/70 font-medium leading-relaxed">
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red" />
                1. Acceptance of Terms
              </h3>
              <p className="pl-6">By accessing or using OptiPrompt, you agree to be bound by these Terms of Use and all applicable laws and regulations governing neural instruction optimization.</p>
            </div>
            
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red" />
                2. Neural License
              </h3>
              <p className="pl-6">Permission is granted to utilize the OptiPrompt laboratory for your specific prompt engineering requirements. This is a license for optimization services, not a transfer of neural core ownership.</p>
            </div>
            
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest mb-4 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red" />
                3. API Architecture Usage
              </h3>
              <p className="pl-6">You agree to use the optimization endpoints responsibly. Any attempt to bypass routing protocols or exploit the neural cache is strictly prohibited.</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-black/5 flex justify-between items-center opacity-40">
        <div className="text-[10px] font-black uppercase tracking-widest">OptiPrompt Legal Unit</div>
        <div className="text-[10px] font-bold uppercase tracking-widest">© 2026</div>
      </footer>
    </div>
  );
}
