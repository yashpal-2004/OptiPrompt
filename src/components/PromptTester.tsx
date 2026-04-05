import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, Loader2, Info, Copy, Check, RotateCcw, AlertCircle, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import { useCurrency } from '../lib/CurrencyContext';
import { useKeys, KeyStatus } from '../lib/KeyContext';

interface OptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  costSaved: number;
  optimizedCost: number;
  mode: 'cheap' | 'quality' | 'extreme';
  model: string;
}

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2.5 bg-gray-900/95 backdrop-blur-md text-white text-[11px] font-medium rounded-xl shadow-2xl w-56 text-center pointer-events-none border border-white/10"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MODEL_PRICING: Record<string, number> = {
  'gemini-1.5-flash': 0.000002,
  'gemini-1.5-pro': 0.000010,
  'gemini-2.0-flash-exp': 0.000001,
};

// Gemini API Key rotation is now handled by KeyContext

// Simple in-memory cache to avoid redundant API calls
const optimizationCache = new Map<string, string>();

function preOptimizePrompt(prompt: string): string {
  const fillers = ['please', 'kindly', 'could you', 'would you', 'i would like to', 'can you help me with'];
  let optimized = prompt.toLowerCase();
  fillers.forEach(f => {
    optimized = optimized.replace(new RegExp(`\\b${f}\\b`, 'gi'), '');
  });
  optimized = optimized.trim().replace(/\s+/g, ' ');

  if (optimized.length < 20 && !optimized.includes(':')) {
    return `Task: ${optimized}\nFormat: 3 bullet points\nConstraints: Under 100 words`;
  }
  return optimized;
}

export function PromptTester({ 
  onOptimize 
}: { 
  onOptimize?: (result: OptimizationResult) => void;
}) {
  const { formatCost } = useCurrency();
  const { keys, getNextKey, updateKeyStatus } = useKeys();
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'cheap' | 'quality' | 'extreme'>('quality');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OptimizationResult[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const mostCostEffectiveIndex = React.useMemo(() => {
    if (!results || results.length === 0) return -1;
    let minCost = Infinity;
    let minIdx = -1;
    results.forEach((res, idx) => {
      if (res.optimizedCost < minCost) {
        minCost = res.optimizedCost;
        minIdx = idx;
      }
    });
    return minIdx;
  }, [results]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const reset = () => {
    setPrompt('');
    setResults(null);
  };

  const retryModel = async (modelId: string, index: number) => {
    if (!results) return;
    
    // Show loading state for this specific card? 
    // For now, let's just update the specific result
    const originalPrompt = results[index].originalPrompt;
    
    // We need the pre-optimized prompt again. 
    // Let's just re-run the whole thing for this model.
    try {
      const preOptimized = preOptimizePrompt(originalPrompt);

      const optimized = await llmOptimize(preOptimized, mode, modelId);
      if (!optimized) return; // Quota still exceeded
      
      const originalTokens = Math.ceil(originalPrompt.length / 4);
      const optimizedTokens = Math.ceil(optimized.length / 4);
      const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
      const modelRate = MODEL_PRICING[modelId] || 0.000002;
      const costSaved = tokensSaved * modelRate;
      const optimizedCost = optimizedTokens * modelRate;

      const newResult: OptimizationResult = {
        originalPrompt,
        optimizedPrompt: optimized,
        originalTokens,
        optimizedTokens,
        tokensSaved,
        costSaved,
        optimizedCost,
        mode,
        model: modelId === 'gemini-1.5-flash' ? 'Gemini 3 Flash' : 
               modelId === 'gemini-2.0-flash-exp' ? 'Gemini 3.1 Flash Lite' : 
               'Gemini 3.1 Pro'
      };

      const newResults = [...results];
      newResults[index] = newResult;
      
      // Re-sort results by efficiency
      const sortedResults = [...newResults].sort((a, b) => b.tokensSaved - a.tokensSaved);
      setResults(sortedResults);
      
      if (optimized !== originalPrompt) {
        toast.success(`Successfully optimized ${modelId}!`);
      }
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const llmOptimize = async (text: string, mode: 'cheap' | 'quality' | 'extreme', model: string, retryCount = 0, keyRetryCount = 0): Promise<string | null> => {
    const cacheKey = `${model}-${mode}-${text}`;
    if (optimizationCache.has(cacheKey)) {
      return optimizationCache.get(cacheKey)!;
    }

    const apiKey = getNextKey();
    const keyInfo = keys.find(k => k.key === apiKey);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      let instruction = "";
      if (mode === 'extreme') {
        instruction = "Rewrite this prompt to be as short as humanly possible while retaining only the absolute essential instructions. Use shorthand, remove all filler words, and condense logic. Return ONLY the rewritten prompt.";
      } else if (mode === 'cheap') {
        instruction = "Rewrite this prompt to reduce token usage significantly without losing core meaning. Be extremely concise. Return ONLY the rewritten prompt.";
      } else {
        instruction = "Refine this prompt to improve its structure, clarity, and fix any grammatical or spelling mistakes. Ensure the original intent and all technical details are preserved. Focus on quality and correctness. Return ONLY the refined prompt.";
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: `${instruction}\n\nPrompt: ${text}` }] }],
        config: {
          maxOutputTokens: 4096,
        }
      });
      
      const result = response.text || text;
      optimizationCache.set(cacheKey, result);
      
      if (keyInfo) {
        updateKeyStatus(keyInfo.id, 'active');
      }
      
      return result;
    } catch (e: any) {
      const isQuotaError = e?.status === 'RESOURCE_EXHAUSTED' || 
                           e?.message?.toLowerCase().includes('quota') || 
                           e?.message?.includes('429') || 
                           e?.code === 429;

      const isAuthError = e?.message?.toLowerCase().includes('api key') || 
                          e?.status === 'UNAUTHENTICATED' ||
                          e?.message?.includes('401') ||
                          e?.message?.includes('403');

      if (keyInfo) {
        const errorStatus: KeyStatus = isQuotaError ? 'quota_exceeded' : (isAuthError ? 'invalid' : keyInfo.status);
        updateKeyStatus(keyInfo.id, errorStatus, e?.message);
      }

      // If it's a quota or auth error, try the next key
      if ((isQuotaError || isAuthError) && keyRetryCount < keys.length - 1) {
        console.warn(`Key failed, trying next key...`);
        return llmOptimize(text, mode, model, retryCount, keyRetryCount + 1);
      }

      if (isQuotaError) {
        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return llmOptimize(text, mode, model, retryCount + 1, 0);
        }
        return null; 
      } else if (isAuthError && keys.length === 0) {
        toast.error("Invalid API Key", {
          description: "Please check your GEMINI_API_KEY in the Secrets panel."
        });
        return null;
      }
      return text;
    }
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      // 1. Get rule-based and template optimization locally
      const preOptimized = preOptimizePrompt(prompt);

      // 2. Run optimization for all models with increased staggered delay
      const modelIds = Object.keys(MODEL_PRICING);
      const optimizationPromises = modelIds.map(async (modelId, index) => {
        // Increased staggered delay (0ms, 800ms, 1600ms) to reduce burst pressure
        if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 800));
        
        const optimized = await llmOptimize(preOptimized, mode, modelId);
        if (!optimized) return null;
        
        const originalTokens = Math.ceil(prompt.length / 4);
        const optimizedTokens = Math.ceil(optimized.length / 4);
        const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
        const modelRate = MODEL_PRICING[modelId] || 0.000002;
        const costSaved = tokensSaved * modelRate;
        const optimizedCost = optimizedTokens * modelRate;

        return {
          originalPrompt: prompt,
          optimizedPrompt: optimized,
          originalTokens,
          optimizedTokens,
          tokensSaved,
          costSaved,
          optimizedCost,
          mode,
          model: modelId === 'gemini-1.5-flash' ? 'Gemini 3 Flash' : 
                 modelId === 'gemini-2.0-flash-exp' ? 'Gemini 3.1 Flash Lite' : 
                 'Gemini 3.1 Pro'
        } as OptimizationResult;
      });

      const allResults = await Promise.all(optimizationPromises);
      const validResults = allResults.filter((r): r is OptimizationResult => r !== null);

      if (validResults.length === 0) {
        // Suppress quota error toast as requested by user
        setResults([]);
        return;
      }

      // 3. Sort by tokens saved (efficiency)
      const sortedResults = validResults.sort((a, b) => b.tokensSaved - a.tokensSaved);

      setResults(sortedResults);
      
      // Notify parent about the best result
      if (onOptimize) onOptimize(sortedResults[0]);

    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-12">
        {/* Input Section */}
        <motion.div 
          layout
          className="flex flex-col space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[2px] font-display">Source Input</h3>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={reset}
                className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-rose-100"
                title="Clear content"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Reset</span>
                </div>
              </button>
              <div className="relative flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 shadow-inner">
                {(['quality', 'cheap', 'extreme'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "relative px-4 py-2 text-[10px] font-black rounded-xl transition-all duration-300 uppercase tracking-widest",
                      mode === m ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {mode === m && (
                      <motion.div
                        layoutId="activeMode"
                        className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-100"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{m}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Inject your prompt here..."
              className="w-full h-[300px] p-8 glass-dark text-white border-white/10 rounded-[3rem] focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all resize-none shadow-2xl font-mono text-sm leading-relaxed placeholder:text-slate-500 custom-scrollbar"
            />
            <div className="absolute bottom-8 right-8 flex items-center gap-4">
               <div className="px-4 py-2 glass border-white/20 rounded-xl text-[10px] font-black text-white/70 uppercase tracking-widest backdrop-blur-md">
                 {prompt.length} chars
               </div>
               <div className="px-4 py-2 glass border-white/20 rounded-xl text-[10px] font-black text-white/70 uppercase tracking-widest backdrop-blur-md">
                 ~{Math.ceil(prompt.length / 4)} tokens
               </div>
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading || !prompt.trim()}
            className="relative overflow-hidden w-full py-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-black rounded-3xl shadow-[0_20px_50px_-15px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-4 group active:scale-[0.98] active:shadow-none"
          >
            {loading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <>
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Zap className="w-5 h-5 text-white fill-current animate-pulse" />
                </div>
                <span className="text-lg font-display tracking-tight">ACTIVATE OPTIMIZER</span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </>
            )}
          </button>
        </motion.div>

        {/* Output Section */}
        <motion.div 
          layout
          className="flex flex-col space-y-6"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[2px] font-display">Optimization Results</h3>
            </div>
            <div className="flex items-center gap-2">
               <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[9px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
                 Multi-Node Parallel
               </span>
            </div>
          </div>

          <div className="space-y-8 pr-4 px-2 pb-10">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col items-center justify-center glass border-indigo-100 rounded-[3rem] backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-600 animate-pulse" />
                    </div>
                    <p className="text-xl font-black text-slate-900 font-display tracking-tight">Intercepting LLM Nodes...</p>
                    <p className="text-sm text-slate-500 font-medium mt-2">Computing cost vectors and semantic weights</p>
                  </div>
                </motion.div>
              ) : results ? (
                results.length > 0 ? (
                  results.map((res, idx) => (
                    <motion.div
                      key={res.model}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "relative group glass rounded-[2.5rem] border-slate-200 overflow-hidden transition-all duration-500 shadow-2xl shadow-slate-200/40",
                        idx === 0 ? "border-emerald-200 ring-2 ring-emerald-500/10" : "hover:border-indigo-200"
                      )}
                    >
                      {/* Header */}
                      <div className={cn(
                        "px-8 py-5 flex items-center justify-between border-b transition-colors",
                        idx === 0 ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50/50 border-slate-100"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm",
                             idx === 0 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all")}>
                            {res.model.substring(0, 1)}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-900 font-display block leading-none">{res.model}</span>
                            <div className="flex items-center gap-2 mt-1.5">
                              {idx === 0 && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-sm">
                                  EFFICIENCY LEADER
                                </span>
                              )}
                              {idx === mostCostEffectiveIndex && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-sm">
                                  COST OPTIMAL
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-4 mr-2">
                             <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SAVED</p>
                               <p className="text-sm font-black text-emerald-600">-{res.tokensSaved}</p>
                             </div>
                             <div className="text-right border-l border-slate-200 pl-4">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UNIT COST</p>
                               <p className="text-sm font-black text-indigo-600">{formatCost(res.optimizedCost)}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(res.optimizedPrompt, idx)}
                              className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                            >
                              {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content Section - Improved Visibility */}
                      <div className="p-10 group/content relative bg-white/50 backdrop-blur-sm">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[2px] block mb-2">Refined Optimized Context</label>
                          <div className="font-mono text-[14px] font-bold text-slate-800 leading-[1.8] min-h-[300px] overflow-y-visible whitespace-pre-wrap pr-6 border-l-2 border-indigo-100 pl-6 group-hover:border-indigo-500 transition-colors">
                            {res.optimizedPrompt}
                          </div>
                        </div>
                        
                        {/* Hover Overlay Actions */}
                        <div className="absolute top-6 right-6 opacity-0 group-hover/content:opacity-100 transition-all duration-300 translate-y-2 group-hover/content:translate-y-0">
                           <div className="flex items-center gap-2">
                             <div className="px-4 py-1.5 bg-slate-900 shadow-xl rounded-xl text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                               <Sparkles className="w-3 h-3 text-indigo-400" />
                               Lossless Compression Applied
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* Footer Stats */}
                      <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                        <div className="flex items-center gap-6">
                           <div className="flex flex-col">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REDUCTION</span>
                             <span className="text-xs font-black text-indigo-600">{res.originalTokens > 0 ? Math.round((res.tokensSaved / res.originalTokens) * 100) : 0}%</span>
                           </div>
                           <div className="flex flex-col border-l border-slate-200 pl-6">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MODAL TOKENS</span>
                             <span className="text-xs font-black text-slate-700">{res.optimizedTokens}</span>
                           </div>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${res.originalTokens > 0 ? Math.round((res.tokensSaved / res.originalTokens) * 100) : 0}%` }}
                             className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                           />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[400px] flex flex-col items-center justify-center glass border-rose-100 rounded-[3rem] p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 animate-float">
                      <AlertCircle className="w-10 h-10 text-rose-500" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 font-display">Compute Limit Reached</h4>
                    <p className="text-slate-500 font-medium mt-2 max-w-xs">All upstream nodes have exhausted their token quota. Re-authorizing in 60 seconds.</p>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center glass border-slate-100 rounded-[3rem] p-12 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-indigo-50/30 -z-10" />
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 border border-slate-100 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h4 className="text-3xl font-black text-slate-900 font-display tracking-tight">Awaiting Authorization</h4>
                  <p className="text-slate-500 font-medium mt-4 max-w-sm leading-relaxed">Input your source prompts to begin the multi-model optimization cycle. Our engine will calculate the most cost-effective path automatically.</p>
                  
                  <div className="mt-12 flex gap-4">
                     {[...Array(3)].map((_, i) => (
                       <div key={i} className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                         <motion.div 
                           animate={{ x: [-50, 100] }}
                           transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                           className="w-12 h-full bg-indigo-200"
                         />
                       </div>
                     ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
