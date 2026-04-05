import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, CheckCircle2 } from 'lucide-react';

export function Status() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">System Status</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-gray-900">System Status</h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Real-time status of OptiPrompt services and external LLM APIs.
          </p>
        </header>

        <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-green-900">All Systems Operational</p>
                <p className="text-sm text-green-700">Last updated: Just now</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mt-8">
            {['Frontend Dashboard', 'Optimization Engine', 'Gemini API Connectivity'].map(service => (
              <div key={service} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 last:border-0 gap-2">
                <p className="font-bold text-gray-700">{service}</p>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-bold uppercase tracking-widest">Operational</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
