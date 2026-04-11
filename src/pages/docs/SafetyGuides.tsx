import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export function SafetyGuides() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">Safety Guides</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Safety Guides</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Best practices for secure prompt injection and preventing adversarial attacks.
          </p>
        </header>

        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="prose prose-indigo max-w-none text-gray-600 space-y-4">
            <p>At OptiPrompt, maintaining safety during prompt optimization is critical. Here are a few guides on how we ensure prompts are safely handled.</p>
            <h3 className="text-lg font-bold text-gray-900 mt-6">Input Sanitization</h3>
            <p>Ensure that all user-injected text is sanitized before processing. Our optimization engines do not execute any injected payloads but modifying context can impact downstream outputs.</p>
            
            <h3 className="text-lg font-bold text-gray-900 mt-6">Data Privacy</h3>
            <p>We do not store or use your raw prompts for training our own models. Your data remains completely private throughout the entire lifecycle.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
