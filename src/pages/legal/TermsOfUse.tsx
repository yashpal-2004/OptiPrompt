import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export function TermsOfUse() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">Terms of Use</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">Terms of Use</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Please read these terms carefully before using the OptiPrompt service.
          </p>
        </header>

        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="prose prose-indigo max-w-none text-gray-600 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">1. Acceptance of Terms</h3>
            <p>By accessing or using OptiPrompt, you agree to be bound by these Terms of Use and all applicable laws and regulations.</p>
            
            <h3 className="text-lg font-bold text-gray-900 mt-6">2. Use License</h3>
            <p>Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.</p>
            
            <h3 className="text-lg font-bold text-gray-900 mt-6">3. API Usage</h3>
            <p>You agree to use the optimization endpoints responsibly and not to bypass or exploit routing endpoints.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
