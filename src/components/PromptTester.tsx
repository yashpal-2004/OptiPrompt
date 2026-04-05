import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, Loader2, Info, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { toast } from "sonner";
import { useCurrency } from '../lib/CurrencyContext';

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
  'gemini-3-flash-preview': 0.000002,
  'gemini-3.1-flash-lite-preview': 0.000001,
  'gemini-3.1-pro-preview': 0.000010,
};

// Gemini API Key Rotation Logic
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getNextApiKey() {
  if (GEMINI_KEYS.length === 0) return process.env.GEMINI_API_KEY || '';
  const key = GEMINI_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
  return key;
}

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
        model: modelId === 'gemini-3-flash-preview' ? 'Gemini 3 Flash' : 
               modelId === 'gemini-3.1-flash-lite-preview' ? 'Gemini 3.1 Flash Lite' : 
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

    try {
      const apiKey = GEMINI_KEYS.length > 0 ? GEMINI_KEYS[(currentKeyIndex + keyRetryCount) % GEMINI_KEYS.length] : (process.env.GEMINI_API_KEY as string);
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
          maxOutputTokens: 4096, // Plenty for a prompt, prevents runaway generation
        }
      });
      
      const result = response.text || text;
      optimizationCache.set(cacheKey, result);
      
      // Update global index to distribute load
      if (GEMINI_KEYS.length > 0) {
        currentKeyIndex = (currentKeyIndex + keyRetryCount) % GEMINI_KEYS.length;
      }
      
      return result;
    } catch (e: any) {
      // Handle 429 Resource Exhausted (Quota Exceeded) or other failures
      const isQuotaError = e?.status === 'RESOURCE_EXHAUSTED' || 
                           e?.message?.toLowerCase().includes('quota') || 
                           e?.message?.includes('429') || 
                           e?.code === 429;

      const isTokenLimitError = e?.message?.toLowerCase().includes('max tokens') || 
                                e?.message?.toLowerCase().includes('token limit');

      const isAuthError = e?.message?.toLowerCase().includes('api key') || 
                          e?.status === 'UNAUTHENTICATED' ||
                          e?.message?.includes('401') ||
                          e?.message?.includes('403');

      // If it's a quota or auth error, try the next key
      if ((isQuotaError || isAuthError) && keyRetryCount < GEMINI_KEYS.length - 1) {
        console.warn(`Key ${keyRetryCount + 1} failed, trying next key...`);
        return llmOptimize(text, mode, model, retryCount, keyRetryCount + 1);
      }

      if (isQuotaError) {
        if (retryCount < 2) { // Reduced retries since we have multiple keys
          const delay = Math.pow(2, retryCount) * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return llmOptimize(text, mode, model, retryCount + 1, 0); // Reset key retry but increment global retry
        }
        return null; 
      } else if (isTokenLimitError) {
        toast.error("Prompt too long", {
          description: "The prompt or its optimization exceeds the model's token limit."
        });
        return null;
      } else if (isAuthError && GEMINI_KEYS.length === 0) {
        toast.error("Invalid API Key", {
          description: "Please check your GEMINI_API_KEY in the Secrets panel."
        });
        return null;
      } else {
        console.error('Gemini Optimization failed:', e);
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
          model: modelId === 'gemini-3-flash-preview' ? 'Gemini 3 Flash' : 
                 modelId === 'gemini-3.1-flash-lite-preview' ? 'Gemini 3.1 Flash Lite' : 
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
    <div className="space-y-8">
      <div className="flex flex-col gap-8">
        {/* Input Section */}
        <motion.div 
          layout
          className="flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Input</h3>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full uppercase">Original</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={reset}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                title="Clear prompt"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <div className="relative grid grid-cols-3 bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner overflow-hidden w-[300px]">
                {(['quality', 'cheap', 'extreme'] as const).map((m) => (
                  <div key={m} className="relative">
                    <Tooltip 
                      content={
                        m === 'quality' ? "QUALITY Mode: Refines structure, clarity, and fixes grammatical errors while preserving intent. Best for high-end outputs." :
                        m === 'cheap' ? "CHEAP Mode: AI-powered compression using Gemini. Optimized for minimal cost and maximum token savings." :
                        "EXTREME Mode: Maximum innovation. Strips everything but core logic for the highest level of efficiency."
                      }
                    >
                      <button
                        onClick={() => setMode(m)}
                        className={cn(
                          "relative w-full px-2 py-1.5 text-[10px] font-bold rounded-lg transition-colors duration-300",
                          mode === m ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        {mode === m && (
                          <motion.div
                            layoutId="activeMode"
                            className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-100"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10">{m.toUpperCase()}</span>
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste your long prompt here to see the magic..."
              className="w-full h-[400px] p-6 bg-white border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-sm text-gray-700 leading-relaxed placeholder:text-gray-300"
            />
            <div className="absolute bottom-6 right-6 text-[10px] font-mono text-gray-300 bg-white/80 backdrop-blur px-2 py-1 rounded-md border border-gray-100">
              <motion.span
                key={prompt.length}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block"
              >
                {prompt.length}
              </motion.span> chars
            </div>
          </div>

          <button
            onClick={handleOptimize}
            disabled={loading || !prompt.trim()}
            className="relative overflow-hidden w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Zap className="relative w-5 h-5 group-hover:animate-pulse" />
                <span className="relative">Optimize Prompt</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Output Section */}
        <motion.div 
          layout
          className="flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Output Comparison</h3>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase">Multi-Model</span>
            </div>
          </div>

          <div className="space-y-6 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[400px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-blue-100 rounded-[2rem] backdrop-blur-sm"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                  <p className="mt-4 text-sm font-bold text-blue-600 animate-pulse">Comparing Models...</p>
                </motion.div>
              ) : results ? (
                results.length > 0 ? (
                  results.map((res, idx) => (
                    <motion.div
                      key={res.model}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "relative group bg-white border-2 rounded-3xl overflow-hidden transition-all duration-300",
                        idx === 0 ? "border-green-200 shadow-lg shadow-green-50" : "border-gray-100 hover:border-blue-100"
                      )}
                    >
                      {/* Header */}
                      <div className={cn(
                        "px-6 py-3 flex items-center justify-between border-b",
                        idx === 0 ? "bg-green-50/50 border-green-100" : "bg-gray-50/50 border-gray-100"
                      )}>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-gray-900">{res.model}</span>
                          <div className="flex items-center gap-1.5">
                            {idx === 0 && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-full uppercase tracking-tighter shadow-sm shadow-green-100">
                                Most Efficient
                              </span>
                            )}
                            {idx === mostCostEffectiveIndex && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded-full uppercase tracking-tighter shadow-sm shadow-blue-100">
                                Most Cost-Effective
                              </span>
                            )}
                            {res.optimizedPrompt === res.originalPrompt && (
                              <div className="group/warn relative">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/warn:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl z-50">
                                  Optimization failed or skipped (likely due to rate limits). Original prompt returned.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-3 mr-4">
                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 font-bold uppercase">Saved</p>
                              <p className="text-xs font-black text-green-600">-{res.tokensSaved} tokens</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 font-bold uppercase">Cost</p>
                              <p className="text-xs font-black text-blue-600">{formatCost(res.optimizedCost)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {res.optimizedPrompt === res.originalPrompt && (
                              <button
                                onClick={() => retryModel(res.model, idx)}
                                className="p-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all active:scale-90"
                                title="Retry Optimization"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                              </button>
                            )}
                            <button
                              onClick={() => copyToClipboard(res.optimizedPrompt, idx)}
                              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all active:scale-90"
                            >
                              {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 font-mono text-xs text-gray-700 leading-relaxed max-h-[200px] overflow-y-auto bg-white">
                        {res.optimizedPrompt}
                      </div>

                      {/* Footer Stats */}
                      <div className="px-6 py-2 bg-gray-50/30 flex items-center gap-4 text-[10px] font-bold text-gray-400 border-t border-gray-50">
                        <span>{res.optimizedPrompt.length} chars</span>
                        <span>•</span>
                        <span>{res.optimizedTokens} tokens</span>
                        <span>•</span>
                        <span className="text-purple-600">{res.originalTokens > 0 ? Math.round((res.tokensSaved / res.originalTokens) * 100) : 0}% reduction</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-[400px] flex flex-col items-center justify-center text-amber-600 space-y-4 p-10 text-center bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2rem]"
                  >
                    <AlertCircle className="w-12 h-12 text-amber-400" />
                    <div>
                      <p className="text-sm font-bold">All models reached quota limits</p>
                      <p className="text-xs text-amber-500 mt-1">Please wait a few minutes before trying again.</p>
                    </div>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[400px] flex flex-col items-center justify-center text-gray-400 space-y-4 p-10 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem]"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-gray-100">
                    <Sparkles className="w-8 h-8 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Ready to compare</p>
                    <p className="text-xs text-gray-400 mt-1">Enter a prompt to see how different models optimize it.</p>
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
