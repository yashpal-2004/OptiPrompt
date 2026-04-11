import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Book, Zap, Shield, Sparkles, Code, Terminal, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Documentation() {
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
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">OptiPrompt Docs</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Documentation</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Everything you need to know about optimizing your AI prompts and reducing token costs.
          </p>
        </header>

        <div className="grid gap-8">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
            </div>
            <div className="prose prose-indigo max-w-none text-gray-600 space-y-4">
              <p>OptiPrompt helps you reduce LLM costs by compressing prompts without losing their semantic meaning. Our platform uses advanced algorithms to identify and remove redundant tokens.</p>
              <h3 className="text-lg font-bold text-gray-900 mt-6">Core Concepts</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Token Optimization:</strong> Reducing the number of tokens sent to the LLM.</li>
                <li><strong>Prompt Engineering:</strong> Structuring prompts for maximum efficiency.</li>
                <li><strong>Cost Tracking:</strong> Monitoring your spending in real-time.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Optimization Modes</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-indigo-600 mb-2 uppercase tracking-widest text-xs">Cheap</h4>
                <p className="text-sm text-gray-500">Fast, article-stripping compression for low-priority tasks.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-indigo-600 mb-2 uppercase tracking-widest text-xs">Quality</h4>
                <p className="text-sm text-gray-500">Structural refinement focused on clarity and instruction survival.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-bold text-indigo-600 mb-2 uppercase tracking-widest text-xs">Extreme</h4>
                <p className="text-sm text-gray-500">Aggeessive telegraphic re-engineering for minimum token footprint.</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Terminal className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Metrics & Diagnostics</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { name: 'Total Saved', desc: 'The cumulative financial savings achieved by using optimized prompts instead of the source text.' },
                { name: 'API Spend', desc: 'The actual billing amount incurred for neural processing during your current session.' },
                { name: 'Requests', desc: 'The total count of neural optimization operations performed across all tiers.' },
                { name: 'Tokens', desc: 'The cumulative sum of tokens ingested by the laboratory for refinement.' },
                { name: 'Efficiency', desc: 'The weighted yield of neural optimizations, measuring successfully compressed or refined logic from your original inputs.' },
                { name: 'Avg Latency', desc: 'The real-time average processing speed (in seconds) per neural optimization cycle.' },
                { name: 'Peak Capacity', desc: 'The maximum single-pass compression yield achieved during the current laboratory session.' },
              ].map(m => (
                <div key={m.name} className="border-l-2 border-indigo-100 pl-4">
                  <h4 className="font-bold text-gray-900 mb-1">{m.name}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
