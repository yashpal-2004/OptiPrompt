/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dashboard } from './components/layout/Dashboard';
import { Landing } from './components/layout/Landing';
import { Settings } from './components/features/Settings';
import { Documentation } from './pages/docs/Documentation';
import { ApiReference } from './pages/docs/ApiReference';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { SafetyGuides } from './pages/docs/SafetyGuides';
import { TermsOfUse } from './pages/legal/TermsOfUse';
import { Status } from './components/features/Status';
import { ScrollToTopButton } from './components/shared/ScrollToTopButton';

import { AuthProvider, useAuth } from './lib/AuthContext';
import { CurrencyProvider } from './lib/CurrencyContext';
import { KeyProvider } from './lib/KeyContext';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Outer glow rings */}
          <div className="absolute inset-0 -m-12">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ 
                  rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 border border-dashed border-indigo-200 rounded-full"
              />
            ))}
          </div>

          <motion.div
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-32 h-32 bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-50 flex items-center justify-center overflow-hidden z-10"
          >
            <img 
              src="/logo.png" 
              alt="OptiPrompt Logo" 
              className="w-full h-full object-cover scale-150 mix-blend-multiply"
            />
            <motion.div 
               animate={{ top: ['-10%', '110%'] }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
               className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-sm"
            />
          </motion.div>
        </motion.div>

        <div className="mt-16 space-y-4 relative z-10">
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">OptiPrompt</h1>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Initializing Neural Core</span>
            </div>
          </div>

          {/* Progress loader */}
          <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mx-auto">
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1/2 h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200 rounded-full blur-[120px]" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100 rounded-full blur-[120px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        <Routes>
          <Route 
            path="/" 
            element={!user ? <Landing /> : <Dashboard />} 
          />
          <Route 
            path="/settings" 
            element={user ? <Settings /> : <Navigate to="/" />} 
          />
          <Route 
            path="/docs" 
            element={<Documentation />} 
          />
          <Route 
            path="/api-ref" 
            element={<ApiReference />} 
          />
          <Route 
            path="/privacy" 
            element={<PrivacyPolicy />} 
          />
          <Route 
            path="/safety" 
            element={<SafetyGuides />} 
          />
          <Route 
            path="/terms" 
            element={<TermsOfUse />} 
          />
          <Route 
            path="/status" 
            element={<Status />} 
          />
          <Route 
            path="*" 
            element={<Navigate to="/" />} 
          />
        </Routes>
      </AnimatePresence>
      <ScrollToTopButton />
      <Toaster position="top-right" richColors />
    </div>

  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <CurrencyProvider>
          <KeyProvider>
            <AppContent />
          </KeyProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>

  );
}
