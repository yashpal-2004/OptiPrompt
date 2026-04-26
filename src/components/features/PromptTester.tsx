import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, Loader2, Info, Copy, Check, RotateCcw, AlertCircle, Activity, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from "sonner";
import { useCurrency } from '../../lib/CurrencyContext';
import { useKeys, KeyStatus } from '../../lib/KeyContext';
import { runPreLLMPipeline, setCached, PipelineResult } from '../../lib/OptimizationPipeline';

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

const MODELS = [
  {
    id: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B (Groq)',
    description: 'High-speed inference engine powered by Groq.',
  },
];

const COST_PER_TOKEN = 0.0000001; // effectively free

function NeuralOptimizerLoader() {
  const steps = [
    { label: 'STAGE 1', text: 'Analyzing semantic structure' },
    { label: 'STAGE 2', text: 'Collapsing redundant context' },
    { label: 'STAGE 3', text: 'Injecting intelligence vectors' },
    { label: 'STAGE 4', text: 'Finalizing neural compression' }
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 w-full max-w-sm mx-auto pointer-events-none">
      <div className="w-full space-y-8">
        {/* Progress System */}
        <div className="relative h-[2px] w-full bg-black/5 overflow-hidden">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-red to-transparent opacity-50"
          />
          <motion.div 
            animate={{ width: `${(step + 1) * 25}%` }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 bottom-0 left-0 bg-red"
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
             {steps.map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                   <div className={cn(
                     "w-1.5 h-1.5 transition-all duration-500",
                     step >= i ? "bg-red rotate-45" : "bg-black/10"
                   )} />
                   {i < steps.length - 1 && <div className="w-8 h-[1px] bg-black/5" />}
                </div>
             ))}
          </div>

          <div className="text-center">
            <motion.div
              key={`label-${step}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black text-black uppercase tracking-[0.4em] mb-2"
            >
              {steps[step].label}
            </motion.div>
            <motion.p
              key={`text-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[11px] font-bold text-black/40 uppercase tracking-widest italic"
            >
              {steps[step].text}...
            </motion.p>
          </div>
        </div>

        {/* Binary Stream */}
        <div className="flex justify-center gap-2 h-4 overflow-hidden">
           {[...Array(8)].map((_, i) => (
             <motion.span
               key={i}
               animate={{ 
                 y: [0, -20],
                 opacity: [0, 1, 0]
               }}
               transition={{ 
                 duration: 1 + Math.random(), 
                 repeat: Infinity, 
                 delay: i * 0.1 
               }}
               className="text-[8px] font-mono text-black/10"
             >
               {Math.round(Math.random())}
             </motion.span>
           ))}
        </div>
      </div>
    </div>
  );
}

const optimizationCache = new Map<string, string>();

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
  const [inputCopied, setInputCopied] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [showPipeline, setShowPipeline] = useState(false);
  const [forceReoptimize, setForceReoptimize] = useState(false);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Optimized prompt copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const reset = () => {
    setPrompt('');
    setResults(null);
    setPipelineResult(null);
    setForceReoptimize(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 10);
  };

  const llmOptimize = async (text: string, modelId: string, retryCount = 0, keyRetryCount = 0, force = false): Promise<string | null> => {
    const cacheKey = `${modelId}-${mode}-${text}`;
    if (optimizationCache.has(cacheKey) && !force) return optimizationCache.get(cacheKey)!;
    const apiKey = getNextKey(keyRetryCount);
    const keyInfo = keys.find(k => k.key === apiKey);
    try {
      let instruction = "";
      if (mode === 'extreme') instruction = "REWRITE CHALLENGE: Re-engineer this prompt into a highly dense, telegraphic format. Remove all articles (a, an, the), auxiliary verbs, and social padding. Use industry-standard abbreviations and compact logical operators. The goal is the absolute minimum token footprint without losing instruction integrity. Return ONLY the resulting dense prompt.";
      else if (mode === 'cheap') instruction = "Minimize this prompt's token footprint. Be extremely brief, use direct phrasing, and remove all filler words. Priority: Cost-efficiency. Return ONLY the rewritten prompt.";
      else instruction = "Refine this prompt for maximum clarity, structure, and professional tone. Fix grammar/spelling while preserving all technical details and intent. Return ONLY the refined prompt.";
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: modelId, messages: [{ role: "system", content: instruction }, { role: "user", content: `Prompt: ${text}` }], max_tokens: 4096 })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const result = data.choices?.[0]?.message?.content || text;
      optimizationCache.set(cacheKey, result);
      if (keyInfo) updateKeyStatus(keyInfo.id, 'active');
      return result;
    } catch (e: any) {
      const isQuotaError = e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('rate');
      const isAuthError = e?.message?.includes('401') || e?.message?.includes('403') || e?.message?.toLowerCase().includes('api key');
      if (keyInfo) updateKeyStatus(keyInfo.id, isQuotaError ? 'quota_exceeded' : (isAuthError ? 'invalid' : keyInfo.status), e?.message);
      if ((isQuotaError || isAuthError) && keyRetryCount < keys.length - 1) return llmOptimize(text, modelId, retryCount, keyRetryCount + 1, force);
      return null;
    }
  };

  const handleOptimize = async (force = false) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setPipelineResult(null);
    setForceReoptimize(false);
    try {
      const pipeline = runPreLLMPipeline(prompt, mode, force);
      setPipelineResult(pipeline);
      const pipelinePrompt = pipeline.finalPrompt;
      if (pipeline.cacheHit) {
        const originalTokens = Math.ceil(prompt.length / 4);
        const optimizedTokens = Math.ceil(pipelinePrompt.length / 4);
        const tokensSaved = originalTokens - optimizedTokens;
        const cachedResult: OptimizationResult = { originalPrompt: prompt, optimizedPrompt: pipelinePrompt, originalTokens, optimizedTokens, tokensSaved, costSaved: tokensSaved * COST_PER_TOKEN, optimizedCost: optimizedTokens * COST_PER_TOKEN, mode, model: MODELS[0].label };
        setResults([cachedResult]);
        if (onOptimize) onOptimize(cachedResult);
        setForceReoptimize(true);
        setLoading(false);
        return;
      }
      const optimizationPromises = MODELS.map(async (modelConfig) => {
        const optimized = await llmOptimize(pipelinePrompt, modelConfig.id, 0, 0, force);
        if (!optimized) return null;
        setCached(mode, prompt, optimized);
        const originalTokens = Math.ceil(prompt.length / 3.7);
        const optimizedTokens = Math.ceil(optimized.length / 3.7);
        let finalOptimized = optimized;
        let finalOptimizedTokens = optimizedTokens;
        if (mode !== 'quality' && optimizedTokens > originalTokens) { finalOptimized = prompt; finalOptimizedTokens = originalTokens; }
        const tokensSaved = Math.max(0, originalTokens - finalOptimizedTokens);
        return { originalPrompt: prompt, optimizedPrompt: finalOptimized, originalTokens, optimizedTokens: finalOptimizedTokens, tokensSaved, costSaved: tokensSaved * COST_PER_TOKEN, optimizedCost: finalOptimizedTokens * COST_PER_TOKEN, mode, model: modelConfig.label } as OptimizationResult;
      });
      const allResults = await Promise.all(optimizationPromises);
      const validResults = allResults.filter((r): r is OptimizationResult => r !== null);
      if (validResults.length === 0) { setResults([]); return; }
      const sortedResults = validResults.sort((a, b) => b.tokensSaved - a.tokensSaved);
      setResults(sortedResults);
      if (onOptimize) onOptimize(sortedResults[0]);
    } catch (error: any) {
      toast.error("Optimizer stalled", { description: error?.message || "Internal engine error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6 lg:gap-8 items-stretch min-h-[500px] lg:min-h-[600px]">
      {/* Input Section */}
      <motion.div className="flex flex-col space-y-8 bg-white p-10 border-l-[6px] border-black shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em]">Source Input</h3>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {prompt.trim() && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => { navigator.clipboard.writeText(prompt); setInputCopied(true); toast.success('Source prompt copied!'); setTimeout(() => setInputCopied(false), 2000); }} className="p-2 text-black/40 hover:text-red transition-all border-none bg-transparent cursor-pointer">
                  {inputCopied ? <Check className="w-4 h-4 text-red" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              )}
            </AnimatePresence>
            <button onClick={reset} className="p-2 text-black/40 hover:text-red transition-all border-none bg-transparent cursor-pointer">
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="relative flex bg-[#f3f2ee] p-1 border border-black">
              {(['quality', 'cheap', 'extreme'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={cn("relative px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 border-none cursor-pointer", mode === m ? "text-white" : "text-black opacity-40 hover:opacity-100")}>
                  {mode === m && <motion.div layoutId="activeMode" className="absolute inset-0 bg-black z-0" />}
                  <span className="relative z-10">{m}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="relative flex-1 group min-h-[400px]">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="INJECT SOURCE PROMPT..." className="w-full h-full p-8 bg-[#f3f2ee]/50 border-none focus:ring-0 transition-all resize-none font-mono text-base leading-relaxed placeholder:text-black/10 custom-scrollbar outline-none uppercase" />
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/80 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 backdrop-blur-md"> {prompt.trim().length} chars </div>
            <div className="px-3 py-1.5 bg-white/80 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 backdrop-blur-md"> ~{Math.ceil(prompt.trim().length / 4)} tokens </div>
          </div>
        </div>
        <div className="space-y-6">
          {!prompt && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-black text-black/40 uppercase tracking-widest mr-2">Quick load:</span>
              {[
                "Marketing SaaS copy",
                "Code optimization",
                "Technical blogging"
              ].map((ex, i) => (
                <button
                  key={ex}
                  onClick={() => {
                    const examples = [
                      "Write a very detailed and engaging blog post about quantum computing that explains everything from basic to advanced topics.",
                      "Review this code and make it faster, cleaner, and production ready.",
                      "Brainstorm some creative marketing ideas for a SaaS product that can work for any industry and any audience."
                    ];
                    setPrompt(examples[i]);
                  }}
                  className="px-3 py-1.5 bg-[#f3f2ee] border-none text-[9px] font-black uppercase tracking-widest text-black/60 hover:bg-black hover:text-white transition-all cursor-pointer"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button disabled={!prompt.trim() || loading} onClick={() => handleOptimize()} className={cn("relative overflow-hidden flex-1 py-5 font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 active:scale-[0.98] border-none cursor-pointer", prompt.trim() && !loading ? "bg-red text-white hover:bg-black" : "bg-black/5 text-black/20 cursor-not-allowed")}>
              {loading ? <div className="flex items-center gap-3"> <Activity className="w-5 h-5 animate-pulse" /> <span className="text-[12px]">Processing Neural Vectors...</span> </div> : <> <Zap className="w-5 h-5 text-white fill-current" /> <span className="text-[12px]">Optimise Now</span> </>}
            </button>
            <AnimatePresence>
              {forceReoptimize && !loading && (
                <motion.button key="reoptimize" initial={{ opacity: 0, scale: 0.9, width: 0 }} animate={{ opacity: 1, scale: 1, width: 'auto' }} exit={{ opacity: 0, scale: 0.9, width: 0 }} transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }} onClick={() => handleOptimize(true)} className="overflow-hidden px-5 py-4 bg-black text-white font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] whitespace-nowrap cursor-pointer border-none">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[11px] uppercase tracking-widest">Force fresh</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Output Section */}
      <motion.div className="flex flex-col bg-white text-black p-10 border-l-[6px] border-red shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h3 className="text-[11px] font-black text-black uppercase tracking-[0.2em]">Optimization Gallery</h3>
          </div>
          {results && results.length > 0 && !loading && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-3 py-1 bg-red text-white text-[9px] font-black uppercase tracking-[0.2em]"> Neural Success </motion.div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <NeuralOptimizerLoader key="loader" />
            ) : results && results.length > 0 ? (
              <div key="results-list" className="space-y-6 pb-6">
                {results.map((res, idx) => (
                  <motion.div key={`${res.model}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative group border border-black/5 bg-[#f3f2ee]/50 overflow-hidden will-change-transform">
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red text-white flex items-center justify-center font-black text-[10px]"> {res.model.substring(0, 1)} </div>
                        <div>
                          <span className="text-xs font-black text-black block leading-tight uppercase tracking-widest">{res.model}</span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            <span className="text-[9px] font-bold text-black/40 whitespace-nowrap">{res.originalTokens} → {res.optimizedTokens} tokens</span>
                            <div className="w-1 h-1 bg-black/10 rounded-full" />
                            <span className={cn("text-[9px] font-bold whitespace-nowrap", res.tokensSaved >= 0 ? "text-red" : "text-amber-600")}> {res.tokensSaved >= 0 ? `-${res.tokensSaved}` : `+${Math.abs(res.tokensSaved)}`} {res.tokensSaved >= 0 ? 'saved' : 'added'} </span>
                            <div className="w-1 h-1 bg-black/10 rounded-full" />
                            <span className="text-[9px] font-bold text-black/40 whitespace-nowrap">{formatCost(res.optimizedCost)}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => copyToClipboard(res.optimizedPrompt, idx)} className="p-2 hover:bg-black/5 transition-all border-none bg-transparent cursor-pointer">
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-red" /> : <Copy className="w-4 h-4 text-black/40" />}
                      </button>
                    </div>
                    <div className="p-8">
                      <div className="font-mono text-sm font-medium text-black/80 leading-relaxed whitespace-pre-wrap">{res.optimizedPrompt}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[400px]"
              >
                <div className="relative mb-12">
                  {/* Modern Professional Animation */}
                  <div className="w-24 h-24 relative flex items-center justify-center">
                    <motion.div 
                      animate={{ 
                        rotate: 360,
                        borderTopColor: ['#e61e2a', '#000000', '#e61e2a'],
                        borderRightColor: ['#000000', '#e61e2a', '#000000']
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-[2px] border-transparent border-t-red border-r-black rounded-full opacity-20"
                    />
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-12 h-12 bg-red rounded-full blur-2xl absolute"
                    />
                    <div className="relative z-10 w-2 h-2 bg-black rounded-full" />
                  </div>
                  
                  <motion.div 
                    animate={{ width: ['0%', '100%', '0%'], left: ['0%', '0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-6 left-0 h-[1px] bg-red/30 w-full"
                  />
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-black font-display tracking-[0.3em] uppercase">Ready for Input</h4>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-[1px] bg-red" />
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                      System Idle // Awaiting Instruction Vectors
                    </p>
                    <div className="w-1.5 h-[1px] bg-red" />
                  </div>
                  <p className="text-[11px] text-black/30 font-medium max-w-[320px] leading-relaxed mx-auto italic">
                    Enter your source prompt in the left panel to begin the neural optimization cycle. Results will be streamed here in realtime with full compression diagnostics.
                  </p>
                </div>
                
                <div className="mt-12 flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1 h-1 bg-black/10"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
