import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type KeyStatus = 'active' | 'quota_exceeded' | 'invalid' | 'unknown';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: KeyStatus;
  lastUsed?: Date;
  error?: string;
}

interface KeyContextType {
  keys: ApiKey[];
  updateKeyStatus: (id: string, status: KeyStatus, error?: string) => void;
  updateKey: (id: string, key: string) => void;
  getNextKey: (index?: number) => string;
}

const KeyContext = createContext<KeyContextType | undefined>(undefined);

const STORAGE_KEY = 'optiprompt_keys_v2';

export const KeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<ApiKey[]>(() => {
    // Initial fallback to ENV
    const envKey1 = (import.meta as any).env?.VITE_GROQ_API_KEY || "";
    const envKey2 = (import.meta as any).env?.VITE_GROQ_API_KEY_2 || "";

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ApiKey[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // ENV Override Logic: If env key is provided, it takes precedence over storage
          // to ensure .env changes are always reflected on startup.
          return parsed.map(k => {
            if (k.id === 'groq-1' && envKey1) return { ...k, key: envKey1, status: envKey1 === k.key ? k.status : 'unknown' };
            if (k.id === 'groq-2' && envKey2) return { ...k, key: envKey2, status: envKey2 === k.key ? k.status : 'unknown' };
            return k;
          });
        }
      } catch (e) {
        console.error("Failed to parse keys from storage", e);
      }
    }
    
    return [
      { id: 'groq-1', name: 'Primary Node', key: envKey1, status: 'unknown' as KeyStatus },
      { id: 'groq-2', name: 'Secondary Node (Failover)', key: envKey2, status: 'unknown' as KeyStatus },
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  }, [keys]);

  const updateKeyStatus = useCallback((id: string, status: KeyStatus, error?: string) => {
    setKeys(prev => prev.map(k => 
      k.id === id ? { ...k, status, error, lastUsed: new Date() } : k
    ));
  }, []);

  const updateKey = useCallback((id: string, key: string) => {
    setKeys(prev => prev.map(k => 
      k.id === id ? { ...k, key, status: 'unknown', error: undefined } : k
    ));
  }, []);

  const getNextKey = useCallback((index = 0) => {
    const activeKeys = keys.filter(k => k.key);
    if (activeKeys.length === 0) return "";
    return activeKeys[index % activeKeys.length].key;
  }, [keys]);

  return (
    <KeyContext.Provider value={{ keys, updateKeyStatus, updateKey, getNextKey }}>
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

