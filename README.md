# OPTIPROMPT.
### High-Performance Neural Engineering & Optimization Studio

**OptiPrompt** is a premier, creative-studio-inspired workspace designed to architect, optimize, and scale LLM interactions. By merging advanced semantic compression with high-fidelity logical refinement, OptiPrompt transforms raw prompts into high-density neural vectors, reducing token overhead by up to 60% while maximizing instruction clarity.

## Neural Core Architecture

OptiPrompt utilizes a sophisticated multi-stage pipeline to re-engineer instructions for maximum performance and cost-efficiency:

- **Semantic Synthesis** — Analyzes prompt intent to collapse redundant context and social padding.
- **Structural Injection** — Automatically reformats prompts into high-clarity technical blocks.
- **Token Compression** — Utilizes a telegraphic refactoring engine to minimize footprint.
- **Diagnostic Real-time Analytics** — Monitors every optimization cycle with precision diagnostics.

## Laboratory Features

- **Tiered Optimization Modes**:
  - **CHEAP**: Aggressive token reduction for high-volume tasks.
  - **QUALITY**: Precision refinement focusing on logic and professional tone.
  - **EXTREME**: High-density telegraphic refactoring for minimum token costs.
- **Multi-Node Failover**: Industrial-grade reliability with automatic rotation between primary and secondary Groq nodes.
- **Creative Studio Aesthetic**: A premium beige, red, and black design language featuring 60px grid overlays and minimalist fluid animations (`motion/react`).
- **Interactive Diagnostics**: Real-time telemetry monitoring latency, API spend, and compression yield.

## Performance Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Compute Engine**: [Groq](https://groq.com/) (Llama-3.3-70B-Versatile)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) + Custom Studio Design System
- **Animations**: [Framer Motion](https://framer.com/motion)
- **Persistence**: [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **Icons**: [Lucide React](https://lucide.dev/)

## Deployment Protocol

### Prerequisites
- Node.js 18+
- [Groq API Keys](https://console.groq.com/) (Supports dual-node rotation)

### Installation
1. **Initialize Workspace**:
   ```bash
   git clone https://github.com/yashpal-2004/optiprompt.git
   cd OptiPrompt
   ```
2. **Synchronize Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Neural Environment**:
   Create a `.env` file at the root:
   ```env
   VITE_GROQ_API_KEY=primary_node_key
   VITE_GROQ_API_KEY_2=failover_node_key
   ```

### Execution
Launch the local development laboratory:
```bash
npm run dev
```

## 📁 Neural Architecture

The workspace is organized into modular tiers for maximum scalability:

- `src/components/layout/` — High-fidelity UI shells (Landing & Dashboard).
- `src/components/features/` — Neural engine interfaces (Laboratory, Analytics, Settings).
- `src/lib/` — Optimization Pipeline logic and neural state management.
- `public/images/` — High-resolution studio assets and visualizations.