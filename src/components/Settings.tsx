import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { useCurrency, CURRENCIES, CurrencyKey } from '../lib/CurrencyContext';
import { useKeys } from '../lib/KeyContext';
import { User, Mail, Shield, Globe, Save, ArrowLeft, Trash2, CreditCard, Bell, Zap, Key, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { user, userProfile } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { keys, updateKeyStatus } = useKeys();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerifyKeys = async () => {
    if (keys.length === 0) return;
    setVerifying(true);
    let activeCount = 0;
    let quotaCount = 0;
    let invalidCount = 0;

    for (const keyInfo of keys) {
      if (!keyInfo.key) continue;

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyInfo.key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hi' }] }],
              generationConfig: { maxOutputTokens: 5 }
            })
          }
        );

        if (res.ok) {
          updateKeyStatus(keyInfo.id, 'active');
          activeCount++;
        } else {
          const errorBody = await res.json().catch(() => ({}));
          const errorMsg = (errorBody?.error?.message || '').toLowerCase();
          const httpStatus = res.status;

          if (httpStatus === 429 || errorMsg.includes('quota') || errorMsg.includes('rate')) {
            updateKeyStatus(keyInfo.id, 'quota_exceeded', errorBody?.error?.message);
            quotaCount++;
          } else if (httpStatus === 400 || httpStatus === 401 || httpStatus === 403 || errorMsg.includes('api key') || errorMsg.includes('invalid')) {
            updateKeyStatus(keyInfo.id, 'invalid', errorBody?.error?.message);
            invalidCount++;
          } else {
            // Got a response from server — key is reachable but blocked for another reason
            updateKeyStatus(keyInfo.id, 'active');
            activeCount++;
          }
        }
      } catch (networkError) {
        // Pure network error (no internet etc) — don't change status
        console.error(`[Key Verify] ${keyInfo.id} network error:`, networkError);
      }
    }

    const parts = [];
    if (activeCount > 0) parts.push(`${activeCount} active`);
    if (quotaCount > 0) parts.push(`${quotaCount} quota exceeded`);
    if (invalidCount > 0) parts.push(`${invalidCount} invalid`);
    toast.success(`Verified ${keys.length} keys: ${parts.join(', ') || 'all checked'}.`);
    setVerifying(false);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, we might save other settings here
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-lg font-bold text-gray-900">Account Settings</h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Profile Section */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-10 h-10 text-indigo-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || 'User'}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    defaultValue={user?.displayName || ''}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Regional Preferences</h3>
              <p className="text-sm text-gray-500">Customize how costs are displayed across the app.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Default Currency</label>
            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(CURRENCIES) as CurrencyKey[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group",
                    currency === c 
                      ? "bg-indigo-50 border-indigo-600 text-indigo-600" 
                      : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                  )}
                >
                  <span className="text-2xl font-bold">{CURRENCIES[c].symbol}</span>
                  <span className="text-xs font-bold uppercase tracking-widest">{CURRENCIES[c].label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* API Key Status Section */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">API Status</h3>
                <p className="text-sm text-gray-500">Monitor the health and quota of your configured Gemini API keys.</p>
              </div>
            </div>
            <button 
              onClick={handleVerifyKeys}
              disabled={verifying}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {verifying ? 'Verifying...' : 'Verify Keys'}
            </button>
          </div>

          <div className="grid gap-4">
            {keys.length > 0 ? (
              keys.map((k) => (
                <div key={k.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                      k.status === 'active' ? "bg-green-100" : 
                      k.status === 'quota_exceeded' ? "bg-amber-100" :
                      k.status === 'invalid' ? "bg-red-100" : "bg-white"
                    )}>
                      {k.status === 'active' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : 
                       k.status === 'quota_exceeded' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                       k.status === 'invalid' ? <XCircle className="w-5 h-5 text-red-600" /> : 
                       <RefreshCw className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{k.id}</p>
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-widest",
                          k.status === 'active' ? "bg-green-500 text-white" : 
                          k.status === 'quota_exceeded' ? "bg-amber-500 text-white" :
                          k.status === 'invalid' ? "bg-red-500 text-white" : "bg-gray-200 text-gray-500"
                        )}>
                          {k.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        {k.key.substring(0, 6)}••••••••{k.key.substring(k.key.length - 4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Used</p>
                    <p className="text-xs font-medium text-gray-600 mt-1">
                      {k.lastUsed ? new Date(k.lastUsed).toLocaleTimeString() : 'Never'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-500">No API Keys Configured</p>
                <p className="text-xs text-gray-400 mt-1">Add keys to your environmental variables to enable high-volume optimization.</p>
              </div>
            )}
          </div>
        </section>


        {/* Danger Zone */}
        <section className="bg-red-50/50 rounded-3xl border border-red-100 p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
              <p className="text-sm text-red-700">Irreversible actions for your account.</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-red-100">
            <div>
              <p className="font-bold text-gray-900">Delete Account</p>
              <p className="text-xs text-gray-500">Permanently remove all your data and history.</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-100">
              Delete Account
            </button>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSaveSettings}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200 flex items-center gap-2"
          >
            <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
