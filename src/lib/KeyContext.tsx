import React, { createContext, useContext, useState, useCallback } from 'react';

export type KeyStatus = 'active' | 'quota_exceeded' | 'invalid' | 'unknown';

export interface ApiKey {
  id: string;
  key: string;
  status: KeyStatus;
  lastUsed?: Date;
  error?: string;
}

interface KeyContextType {
  keys: ApiKey[];
  updateKeyStatus: (id: string, status: KeyStatus, error?: string) => void;
  getNextKey: () => string;
}

const KeyContext = createContext<KeyContextType | undefined>(undefined);

// Use dynamically passed keys from vite.config.ts to respect .env order
const rawKeys = (process.env as any).GEMINI_KEYS as { id: string, key: string }[] || [];

const INITIAL_KEYS: ApiKey[] = rawKeys.length > 0 
  ? rawKeys.map(k => ({ id: k.id, key: k.key, status: 'unknown' as KeyStatus }))
  : [
      { id: 'Key 1', key: (process.env as any).GEMINI_API_KEY_1 || '', status: 'unknown' as KeyStatus },
      { id: 'Key 2', key: (process.env as any).GEMINI_API_KEY_2 || '', status: 'unknown' as KeyStatus },
      { id: 'Key 3', key: (process.env as any).GEMINI_API_KEY_3 || '', status: 'unknown' as KeyStatus },
      { id: 'Key 4', key: (process.env as any).GEMINI_API_KEY_4 || '', status: 'unknown' as KeyStatus },
      { id: 'Key 5', key: (process.env as any).GEMINI_API_KEY_5 || '', status: 'unknown' as KeyStatus },
    ].filter(k => k.key);

export const KeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const currentIndexRef = React.useRef(0);

  const updateKeyStatus = useCallback((id: string, status: KeyStatus, error?: string) => {
    setKeys(prev => prev.map(k => 
      k.id === id ? { ...k, status, error, lastUsed: new Date() } : k
    ));
  }, []);

  const getNextKey = useCallback(() => {
    if (keys.length === 0) return process.env.GEMINI_API_KEY || '';
    
    // First, try to find an 'active' or 'unknown' key starting from current index
    let startIdx = currentIndexRef.current;
    
    for (let i = 0; i < keys.length; i++) {
        const potentialIdx = (startIdx + i) % keys.length;
        const potentialKey = keys[potentialIdx];
        
        if (potentialKey.status === 'active' || potentialKey.status === 'unknown') {
            currentIndexRef.current = (potentialIdx + 1) % keys.length;
            return potentialKey.key;
        }
    }
    
    // If all keys are marked bad, fallback to simple blind rotation for retries
    const key = keys[currentIndexRef.current].key;
    currentIndexRef.current = (currentIndexRef.current + 1) % keys.length;
    return key;
  }, [keys]);

  return (
    <KeyContext.Provider value={{ keys, updateKeyStatus, getNextKey }}>
      {children}
    </KeyContext.Provider>
  );
};

export const useKeys = () => {
  const context = useContext(KeyContext);
  if (context === undefined) {
    throw new Error('useKeys must be used within a KeyProvider');
  }
  return context;
};
