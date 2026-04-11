# OptiPrompt 🚀

**OptiPrompt** is a state-of-the-art neural workspace designed to architect, optimize, and scale your LLM interactions. By leveraging advanced 6-stage compression algorithms and high-fidelity logical refinement, OptiPrompt reduces token overhead by up to 80% while enhancing instruction clarity.

![OptiPrompt Neural Dashboard](https://picsum.photos/seed/optiprompt/1200/400)

## ✨ Neural Optimization Core

OptiPrompt goes beyond simple prompting. It utilizes a sophisticated multi-stage pipeline to re-engineer instructions for maximum performance:

- **Stage 1: Rule Cleaner** — Eliminates linguistic filler and social padding.
- **Stage 2: Context Reducer** — Strips redundant preambles while preserving technical context.
- **Stage 3: Template Formatter** — Automatically structures prompts based on intent (Code, Logic, Creative).
- **Stage 4: Output Controller** — Enforces token-efficient response constraints.
- **Stage 5: Neural Cache** — Instant retrieval for repeated prompt patterns (Zero Latency).
- **Stage 6: LLM Compressor** — Semantic refactoring via Groq-powered Llama-3.3-70B.

## 💎 Premium Features

- **Tiered Compression Modes**:
  - **CHEAP**: Aggressive token reduction for cost-sensitive high-volume tasks.
  - **QUALITY**: High-fidelity refinement focusing on logic, structure, and professional tone.
  - **EXTREME**: Telegraphic refactoring for maximum density and minimum token footprint.
- **Dual-Node Failover**: Industrial-grade reliability with automatic rotation between primary and secondary Groq nodes.
- **Refinement Yield Metrics**: Advanced analytics that credit quality-mode logic enhancement even when token expansion occurs.
- **Real-time Telemetry**: Monitoring of latency, API spend, and compression efficiency across all neural sessions.
- **Enterprise UI**: A luxury-tech aesthetic featuring glassmorphic effects, fluid animations (`motion/react`), and deep responsive layouts.

## 🛠️ Performance Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Compute**: [Groq](https://groq.com/) (Llama-3.3-70B-Versatile)
- **Persistence**: [Firebase Firestore](https://firebase.google.com/)
- **Identity**: [Firebase Auth](https://firebase.google.com/)
- **Visuals**: [Tailwind CSS 4.0](https://tailwindcss.com/) + [Framer Motion](https://framer.com/motion)
- **Analytics**: [Recharts](https://recharts.org/)

## 🚀 Neural Deployment

### Prerequisites
- Node.js 18+
- [Groq API Keys](https://console.groq.com/) (Recommend 2 keys for failover support)

### Installation
1. Clone the workspace:
   ```bash
   git clone https://github.com/yashpal-2004/optiprompt.git
   cd OptiPrompt
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your Neural Nodes in `.env`:
   ```env
   VITE_GROQ_API_KEY=your_primary_key
   VITE_GROQ_API_KEY_2=your_failover_key
   ```

### Execution
Launch the local development laboratory:
```bash
npm run dev
```
Access the dashboard at `http://localhost:3000`.

## 📁 Neural Architecture

The codebase follows a modular, tiered hierarchy for maximum scalability:

- `src/components/layout/`: Core UI shells (Dashboard & Landing systems).
- `src/components/features/`: Neural engine components (Analytics, PromptTester, Settings).
- `src/components/shared/`: Global utilities (Error Boundaries, Scroll recovery).
- `src/lib/`: High-performance context providers and the Optimization Pipeline logic.
- `src/pages/`: Knowledge base and documentation tiers.

---
*Built for the next generation of prompt engineering.*