import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Book, Zap, Shield, Sparkles, Code, Terminal, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">Privacy Policy</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Privacy Policy</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Your data security is our top priority.
          </p>
        </header>

        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Data Protection</h2>
          </div>
          <div className="prose prose-indigo max-w-none text-gray-600 space-y-4">
            <p>At OptiPrompt, we take your privacy seriously. We only collect the data necessary to provide our services and improve your experience.</p>
            <h3 className="text-lg font-bold text-gray-900 mt-6">What We Collect</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Prompts:</strong> We process prompts for optimization. We do not store them permanently unless you choose to save them.</li>
              <li><strong>Usage Data:</strong> We track token usage and costs to provide analytics.</li>
              <li><strong>Account Info:</strong> We use Google Auth for secure login.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
