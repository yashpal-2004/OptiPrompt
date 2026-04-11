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
    <div className="flex flex-col items-center gap-6 py-16 pointer-events-none">
       <div className="relative">
          {/* Main Logo Container */}
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-white rounded-[2rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden relative"
          >
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-150 mix-blend-multiply" />
            
            {/* Pulse Effect */}
            <motion.div 
               animate={{ opacity: [0, 0.2, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-indigo-500"
            />
          </motion.div>
          
          {/* Scanning Line */}
          <motion.div 
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-4 right-4 h-0.5 bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,1)] z-10"
          />
          
          {/* Orbital Particles */}
          <div className="absolute inset-0 -m-4">
             {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-dashed border-indigo-200/50 rounded-full"
                />
             ))}
          </div>
       </div>

       <div className="text-center space-y-3">
         <div className="flex flex-col items-center">
            <motion.span 
               key={`label-${step}`}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-full uppercase tracking-[2px] mb-2 shadow-lg shadow-indigo-100"
            >
              {steps[step].label}
            </motion.span>
            <motion.p 
                key={`text-${step}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-base font-medium text-slate-800 tracking-tight"
            >
              {steps[step].text}...
            </motion.p>
         </div>
         
         <div className="flex gap-2 justify-center">
           {steps.map((_, i) => (
             <motion.div
               key={i}
               animate={{ 
                 width: step === i ? 24 : 6,
                 opacity: step === i ? 1 : 0.2
               }}
               className="h-1 bg-indigo-600 rounded-full transition-all"
             />
           ))}
         </div>
       </div>
    </div>
  );
}


// Legacy optimizationCache replaced by pipeline cache in OptimizationPipeline.ts
const optimizationCache = new Map<string, string>();

const COOKING_MESSAGES = [
  { label: 'STAGE 1', text: 'Obliterating filler words...' },
  { label: 'STAGE 2', text: 'Stripping boilerplate preamble...' },
  { label: 'STAGE 3', text: 'Injecting format directives...' },
  { label: 'STAGE 4', text: 'Locking output constraints...' },
  { label: 'STAGE 6', text: 'Firing LLM compressor...' },
  { label: 'NEURAL', text: 'Rewriting semantic weight vectors...' },
  { label: 'TOKEN', text: 'Collapsing redundant context windows...' },
  { label: 'ENGINE', text: 'Cooking your prompt to perfection...' },
];

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 5 + Math.random() * 90,
  delay: Math.random() * 2,
  duration: 1.5 + Math.random() * 2,
  size: 3 + Math.random() * 5,
  color: i % 4 === 0 ? '#6366f1' : i % 4 === 1 ? '#8b5cf6' : i % 4 === 2 ? '#06b6d4' : '#c084fc',
}));

function CookingAnimation() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % COOKING_MESSAGES.length), 1400);
    return () => clearInterval(t);
  }, []);

  const msg = COOKING_MESSAGES[msgIdx];

  return (
    <motion.div
      key="cooking"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-[3rem] overflow-hidden flex flex-col items-center justify-center py-20 bg-slate-950"
      style={{ minHeight: 420 }}
    >
      {/* Deep space background with crazy pulse */}
      <motion.div 
        animate={{ 
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(99,102,241,0.25)_0%,transparent_70%)]" 
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 4px)',
        }}
      />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full blur-[1px]"
          style={{
            left: `${p.x}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{ y: [0, -(340 + Math.random() * 120)], opacity: [0, 0.9, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Reactor core */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-36 h-36 mb-10">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-indigo-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          {/* Mid ring — reverse */}
          <motion.div
            className="absolute inset-3 rounded-full border-2 border-dashed border-violet-400/50"
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner ring — fast */}
          <motion.div
            className="absolute inset-7 rounded-full border-[3px] border-cyan-400/60"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Glowing core */}
          <motion.div
            className="absolute inset-[30%] rounded-full bg-indigo-500"
            style={{ boxShadow: '0 0 40px 15px rgba(99,102,241,0.6), 0 0 80px 30px rgba(139,92,246,0.3)' }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Orbiting dot */}
          {[0, 120, 240].map((deg, i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400"
              style={{
                top: '50%', left: '50%',
                marginTop: -5, marginLeft: -5,
                boxShadow: '0 0 8px rgba(6,182,212,0.9)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3 - i * 0.5, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
              transformTemplate={(_,t) => `${t} translateX(50px) rotate(${deg}deg)`}
            />
          ))}
        </div>

        {/* Status label with glitch effect */}
        <AnimatePresence mode="wait">
          <motion.div
            key={msgIdx}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.span 
              animate={{ 
                opacity: [1, 0.5, 1],
                textShadow: ['0 0 10px #6366f1', '0 0 20px #8b5cf6', '0 0 10px #6366f1']
              }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="px-4 py-1.5 bg-indigo-500/30 border border-indigo-400/50 rounded-full text-[10px] font-black text-indigo-200 uppercase tracking-[4px] shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              {msg.label}
            </motion.span>
            
            <div className="relative">
              <motion.p 
                animate={{ 
                  x: [-1, 1, -1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{ duration: 0.1, repeat: Infinity }}
                className="text-3xl font-black text-white font-display tracking-tight text-center px-10 relative z-10"
              >
                {msg.text}
              </motion.p>
              {/* Ghost glitch text */}
              <motion.p 
                animate={{ 
                  x: [2, -2, 2],
                  opacity: [0, 0.3, 0],
                }}
                transition={{ duration: 0.1, repeat: Infinity, delay: 0.05 }}
                className="text-3xl font-black text-cyan-400 font-display tracking-tight text-center px-10 absolute inset-0 z-0"
              >
                {msg.text}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Energy bars */}
        <div className="mt-12 flex items-end gap-1.5 h-12">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-indigo-500/40 rounded-full"
              animate={{ 
                height: [10, 48, 15, 40, 10],
                backgroundColor: ['#6366f166', '#8b5cf666', '#06b6d466']
              }}
              transition={{ 
                duration: 0.6 + Math.random() * 0.4, 
                repeat: Infinity,
                delay: i * 0.05
              }}
            />
          ))}
        </div>

        <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Your result is cooking — hang tight
        </p>
      </div>
    </motion.div>
  );
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
  const [inputCopied, setInputCopied] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [showPipeline, setShowPipeline] = useState(false);
  const [forceReoptimize, setForceReoptimize] = useState(false);

  // Debug: List available models for this key
  useEffect(() => {
    const listAvailableModels = async () => {
      const apiKey = getNextKey();
      if (!apiKey) return;
      try {
        const res = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` }
        });
        const result = await res.json();
        console.group("🚀 OptiPrompt: Available Models Discovery");
        console.log("Supported Models List:", result);
        console.groupEnd();
      } catch (err) {
        console.warn("Could not list models:", err);
      }
    };
    listAvailableModels();
  }, []);

  const mostCostEffectiveIndex = useMemo(() => {
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
    toast.success('Optimized prompt copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const reset = () => {
    setPrompt('');
    setResults(null);
    setPipelineResult(null);
    setForceReoptimize(false);
    // Slight delay to allow React to unmount the large result tree before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 10);
  };

  const retryModel = async (index: number) => {
    if (!results) return;
    const modelConfig = MODELS[index];
    if (!modelConfig) return;
    const originalPrompt = results[index].originalPrompt;
    try {
      const optimized = await llmOptimize(originalPrompt, modelConfig.id, 0, 0, true);

      if (!optimized) return;
      
      const originalTokens = Math.ceil(originalPrompt.length / 4);
      const optimizedTokens = Math.ceil(optimized.length / 4);
      const tokensSaved = Math.max(0, originalTokens - optimizedTokens);
      const costSaved = tokensSaved * COST_PER_TOKEN;
      const optimizedCost = optimizedTokens * COST_PER_TOKEN;

      const newResult: OptimizationResult = {
        originalPrompt,
        optimizedPrompt: optimized,
        originalTokens,
        optimizedTokens,
        tokensSaved,
        costSaved,
        optimizedCost,
        mode,
        model: modelConfig.label
      };


      const newResults = [...results];
      newResults[index] = newResult;
      const sortedResults = [...newResults].sort((a, b) => b.tokensSaved - a.tokensSaved);
      setResults(sortedResults);
      
      if (optimized !== originalPrompt) {
        toast.success(`Re-optimized: ${modelConfig.label}`);
      }

    } catch (error) {
      // silent fail - retry is best-effort
    }
  };

  const llmOptimize = async (text: string, modelId: string, retryCount = 0, keyRetryCount = 0, force = false): Promise<string | null> => {
    const cacheKey = `${modelId}-${mode}-${text}`;

    if (optimizationCache.has(cacheKey) && !force) {
      return optimizationCache.get(cacheKey)!;
    }

    const apiKey = getNextKey(keyRetryCount);
    const keyInfo = keys.find(k => k.key === apiKey);

    try {
      let instruction = "";
      if (mode === 'extreme') {
        instruction = "REWRITE CHALLENGE: Re-engineer this prompt into a highly dense, telegraphic format. Remove all articles (a, an, the), auxiliary verbs, and social padding. Use industry-standard abbreviations and compact logical operators. The goal is the absolute minimum token footprint without losing instruction integrity. Return ONLY the resulting dense prompt.";
      } else if (mode === 'cheap') {
        instruction = "Minimize this prompt's token footprint. Be extremely brief, use direct phrasing, and remove all filler words. Priority: Cost-efficiency. Return ONLY the rewritten prompt.";
      } else {
        instruction = "Refine this prompt for maximum clarity, structure, and professional tone. Fix grammar/spelling while preserving all technical details and intent. Return ONLY the refined prompt.";
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: "system", content: instruction },
            { role: "user", content: `Prompt: ${text}` }
          ],
          max_tokens: 4096
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const result = data.choices?.[0]?.message?.content || text;
      
      optimizationCache.set(cacheKey, result);
      
      if (keyInfo) updateKeyStatus(keyInfo.id, 'active');
      return result;

    } catch (e: any) {
      const isQuotaError = e?.message?.includes('429') || 
                           e?.message?.toLowerCase().includes('quota') || 
                           e?.message?.toLowerCase().includes('rate');

      const isAuthError = e?.message?.includes('401') || 
                          e?.message?.includes('403') ||
                          e?.message?.toLowerCase().includes('api key');

      if (keyInfo) {
        const errorStatus: KeyStatus = isQuotaError ? 'quota_exceeded' : (isAuthError ? 'invalid' : keyInfo.status);
        updateKeyStatus(keyInfo.id, errorStatus, e?.message);
      }

      // Retry Logic for Quota using next key
      if ((isQuotaError || isAuthError) && keyRetryCount < keys.length - 1) {
        toast.info("Neural node saturated", {
          description: "Rate limit reached on primary node. Seamlessly transitioning to failover node..."
        });
        return llmOptimize(text, modelId, retryCount, keyRetryCount + 1, force);
      }

      if (isQuotaError) {
        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 3000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return llmOptimize(text, modelId, retryCount + 1, 0, force);
        }
        return null; 
      }

      if (!isQuotaError && !isAuthError) {
        console.error(`Groq Model Error (${modelId}):`, e);
        toast.error(`Model Error: ${modelId}`, {
          description: e?.message || "Check your Groq API key and network connection."
        });
      }
      return null;
    }
  };

  const handleOptimize = async (force = false) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setPipelineResult(null);
    setForceReoptimize(false);
    try {
      // ── Run the full pre-LLM pipeline ──────────────────────────────────────
      const pipeline = runPreLLMPipeline(prompt, mode, force);
      setPipelineResult(pipeline);

      const pipelinePrompt = pipeline.finalPrompt;

      // If cache hit, skip LLM — return pre-pipeline cached result
      if (pipeline.cacheHit) {
        const originalTokens = Math.ceil(prompt.length / 4);
        const optimizedTokens = Math.ceil(pipelinePrompt.length / 4);
        const tokensSaved = originalTokens - optimizedTokens;
        
        const cachedResult: OptimizationResult = {
          originalPrompt: prompt,
          optimizedPrompt: pipelinePrompt,
          originalTokens,
          optimizedTokens,
          tokensSaved,
          costSaved: tokensSaved * COST_PER_TOKEN,
          optimizedCost: optimizedTokens * COST_PER_TOKEN,
          mode,
          model: MODELS[0].label
        };

        setResults([cachedResult]);
        if (onOptimize) onOptimize(cachedResult);

        toast.success('⚡ Returned from cache — zero API calls used!', {
          description: 'Hit "Force Fresh" to force a fresh pass.',
        });
        setForceReoptimize(true);
        setLoading(false);
        return;
      }

      // ── Stage 6: LLM Compressor — single node strategy ─────────────────
      const optimizationPromises = MODELS.map(async (modelConfig) => {
        const startTime = Date.now();
        const optimized = await llmOptimize(pipelinePrompt, modelConfig.id, 0, 0, force);
        const duration = (Date.now() - startTime) / 1000;

        if (!optimized) return null;

        // Cache the final result
        setCached(mode, prompt, optimized);
        
        const originalTokens = Math.ceil(prompt.length / 3.7);
        const optimizedTokens = Math.ceil(optimized.length / 3.7);
        
        // --- Neural Bypass: Prevent Negative Optimization (Except for Quality Mode) ---
        let finalOptimized = optimized;
        let finalOptimizedTokens = optimizedTokens;
        if (mode !== 'quality' && optimizedTokens > originalTokens) {
          finalOptimized = prompt;
          finalOptimizedTokens = originalTokens;
        }

        const tokensSaved = Math.max(0, originalTokens - finalOptimizedTokens);
        const costSaved = tokensSaved * COST_PER_TOKEN;
        const optimizedCost = finalOptimizedTokens * COST_PER_TOKEN;

        return {
          originalPrompt: prompt,
          optimizedPrompt: finalOptimized,
          originalTokens,
          optimizedTokens: finalOptimizedTokens,
          tokensSaved,
          costSaved,
          optimizedCost,
          mode,
          model: modelConfig.label,
          latency: duration,
          timestamp: new Date().toISOString()
        } as OptimizationResult;
      });


      const allResults = await Promise.all(optimizationPromises);
      const validResults = allResults.filter((r): r is OptimizationResult => r !== null);

      if (validResults.length === 0) {
        toast.error("Engine failure", {
          description: "All AI nodes returned errors. Please check your API keys or try again later."
        });
        setResults([]);
        return;
      }

      // 3. Sort by tokens saved (efficiency)
      const sortedResults = validResults.sort((a, b) => b.tokensSaved - a.tokensSaved);

      setResults(sortedResults);
      
      // Notify parent about the best result
      if (onOptimize) onOptimize(sortedResults[0]);

    } catch (error: any) {
      console.error("Optimization Orchestration Failure:", error);
      toast.error("Optimizer stalled", {
        description: error?.message || "Internal engine error. Please check your network or try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6 lg:gap-8 items-stretch min-h-[500px] lg:min-h-[600px]">
      {/* Input Section */}
      <motion.div 
        className="card p-4 sm:p-6 flex flex-col space-y-4 sm:space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 font-display">Source Input</h3>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {prompt.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    navigator.clipboard.writeText(prompt);
                    setInputCopied(true);
                    toast.success('Source prompt copied!');
                    setTimeout(() => setInputCopied(false), 2000);
                  }}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                  title="Copy input"
                >
                  {inputCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              )}
            </AnimatePresence>
            <button
              onClick={reset}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              title="Reset workspace"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="relative flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['quality', 'cheap', 'extreme'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "relative px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all duration-200",
                    mode === m ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="activeMode"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm ring-1 ring-slate-200"
                    />
                  )}
                  <span className="relative z-10 capitalize">{m}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="relative flex-1 group min-h-[400px]">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Inject your source prompt here..."
            className="w-full h-full p-6 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all resize-none font-mono text-sm leading-relaxed placeholder:text-slate-400 custom-scrollbar"
          />
          
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
             <div className="px-3 py-1.5 bg-white/80 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 backdrop-blur-md">
               {prompt.trim().length} chars
             </div>
             <div className="px-3 py-1.5 bg-white/80 border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500 backdrop-blur-md">
               ~{Math.ceil(prompt.trim().length / 4)} tokens
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {!prompt && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-2">Quick load:</span>
              {[
                "Marketing SaaS copy",
                "Code optimization",
                "Technical blogging"
              ].map((ex, i) => (
                <button
                  key={ex}
                  onClick={() => {
                    const examples = [
                      "Write a very detaled and enganging blog post about quantam computing that explain everything from basic to advance topics.",
                      "Review this code and make it more faster, cleaner and production ready.",
                      "Brainstorm some creative marketing ideas for a SaaS product that can work for any industy and any audience."
                    ];
                    setPrompt(examples[i]);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              disabled={!prompt.trim() || loading}
              onClick={() => handleOptimize()}
              className={cn(
                "relative overflow-hidden flex-1 py-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98]",
                prompt.trim() && !loading 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100" 
                  : "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-bold tracking-tight">Optimizing...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-white fill-current" />
                  <span className="text-sm font-bold tracking-tight uppercase tracking-widest">Activate Optimizer</span>
                </>
              )}
            </button>

            <AnimatePresence>
              {forceReoptimize && !loading && (
                <motion.button
                  key="reoptimize"
                  initial={{ opacity: 0, scale: 0.9, width: 0 }}
                  animate={{ opacity: 1, scale: 1, width: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9, width: 0 }}
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                  onClick={() => handleOptimize(true)}
                  title="Bypass cache and force fresh optimization"
                  className="overflow-hidden px-5 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98] whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-[11px] uppercase tracking-widest">Force fresh</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Output Section */}
      <motion.div 
        className="card p-6 flex flex-col bg-slate-50/30 border-dashed border-slate-300"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 font-display">Optimization Gallery</h3>
          </div>
          {results && results.length > 0 && !loading && (
             <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-lg uppercase tracking-widest">
               Neural Success
             </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <NeuralOptimizerLoader key="loader" />
            ) : results && results.length > 0 ? (
              <div key="results-list" className="space-y-6 pb-6">
                {results.map((res, idx) => (
                  <motion.div
                    key={`${res.model}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm will-change-transform"
                  >
                    {/* Compact Result Header */}
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {res.model.substring(0, 1)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block leading-tight">{res.model}</span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                            <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{res.originalTokens} → {res.optimizedTokens} tokens</span>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className={cn(
                              "text-[9px] font-bold whitespace-nowrap",
                              res.tokensSaved >= 0 ? "text-emerald-600" : "text-amber-600"
                            )}>
                              {res.tokensSaved >= 0 ? `-${res.tokensSaved}` : `+${Math.abs(res.tokensSaved)}`} {res.tokensSaved >= 0 ? 'saved' : 'added'}
                            </span>
                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{formatCost(res.optimizedCost)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(res.optimizedPrompt, idx)}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-all"
                      >
                        {copiedIndex === idx ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="font-mono text-[13px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {res.optimizedPrompt}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
                  <div className="relative flex flex-col items-center">
                    <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent mb-1" />
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[6px] mb-1 pl-[6px]">Neural Standby</div>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
                  </div>
                </div>
                
                <h4 className="text-xl font-medium text-slate-900 font-display tracking-tight">Awaiting Neural Logic</h4>
                <p className="text-xs text-slate-500 font-medium mt-3 max-w-[280px] leading-relaxed opacity-80">
                  Initialize the optimization cycle by providing your source prompts. Results will manifest here in realtime with detailed compression metrics.
                </p>
                <div className="mt-8 flex items-center gap-2">
                   <div className="w-1 h-1 bg-slate-300 rounded-full animate-pulse" />
                   <div className="w-1 h-1 bg-slate-300 rounded-full animate-pulse [animation-delay:0.2s]" />
                   <div className="w-1 h-1 bg-slate-300 rounded-full animate-pulse [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
