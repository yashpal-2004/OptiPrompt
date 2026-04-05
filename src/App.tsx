/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dashboard } from './components/Dashboard';
import { Landing } from './components/Landing';
import { Settings } from './components/Settings';
import { Documentation } from './components/Documentation';
import { ApiReference } from './components/ApiReference';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { SafetyGuides } from './components/SafetyGuides';
import { TermsOfUse } from './components/TermsOfUse';
import { Status } from './components/Status';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { CurrencyProvider } from './lib/CurrencyContext';
import { KeyProvider } from './lib/KeyContext';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-blue-600 rounded-xl shadow-xl shadow-blue-200"
        />
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
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <Router>
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
