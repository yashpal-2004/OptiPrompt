import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// --- Optimization Logic ---

function ruleBasedOptimize(prompt: string): string {
  // Remove filler words
  const fillers = ['please', 'kindly', 'could you', 'would you', 'i would like to', 'can you help me with'];
  let optimized = prompt.toLowerCase();
  fillers.forEach(f => {
    optimized = optimized.replace(new RegExp(`\\b${f}\\b`, 'gi'), '');
  });
  return optimized.trim().replace(/\s+/g, ' ');
}

function templateOptimize(prompt: string): string {
  // Vague prompts -> structured
  if (prompt.length < 20 && !prompt.includes(':')) {
    return `Task: ${prompt}\nFormat: 3 bullet points\nConstraints: Under 100 words`;
  }
  return prompt;
}

// --- API Routes ---

app.post('/api/optimize/pre', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  let optimized = ruleBasedOptimize(prompt);
  optimized = templateOptimize(optimized);

  res.json({
    originalPrompt: prompt,
    preOptimizedPrompt: optimized,
  });
});

app.post('/api/usage/log', async (req, res) => {
  // This would normally save to Firestore, but for now we just acknowledge
  // In a real app, we'd use the admin SDK or client-side firestore
  res.json({ status: 'logged' });
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
