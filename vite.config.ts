import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  
  // We read the .env file directly to preserve the line-order of GEMINI_API_KEY_* variables.
  let geminiKeys: { id: string; key: string }[] = [];
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach(line => {
        const match = line.match(/^\s*(GEMINI_API_KEY_\d+)\s*=\s*(.*)/);
        if (match) {
          const keyName = match[1];
          const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Basic parsing
          if (value) {
            const id = keyName.replace('GEMINI_API_KEY_', 'Key ');
            geminiKeys.push({ id, key: value });
          }
        }
      });
    }
  } catch (e) {
    console.error('Failed to parse .env file for ordered keys:', e);
  }

  // Fallback if fs fails or file not found (though loadEnv already ran)
  if (geminiKeys.length === 0) {
    Object.keys(env).forEach(key => {
      if (key.startsWith('GEMINI_API_KEY_')) {
        const id = key.replace('GEMINI_API_KEY_', 'Key ');
        geminiKeys.push({ id, key: env[key] });
      }
    });
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
      'process.env.GEMINI_KEYS': JSON.stringify(geminiKeys),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
