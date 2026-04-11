import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1, label: 'USD' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR' },
  INR: { symbol: '₹', rate: 90, label: 'INR' },
};

export type CurrencyKey = keyof typeof CURRENCIES;

interface CurrencyContextType {
  currency: CurrencyKey;
  setCurrency: (c: CurrencyKey) => Promise<void>;
  formatCost: (val: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [currency, setCurrencyState] = useState<CurrencyKey>('INR');

  useEffect(() => {
    if (userProfile?.currency) {
      setCurrencyState(userProfile.currency as CurrencyKey);
    }
  }, [userProfile]);

  const setCurrency = async (c: CurrencyKey) => {
    setCurrencyState(c);
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { currency: c });
    }
  };

  const formatCost = (val: number) => {
    const { symbol, rate } = CURRENCIES[currency];
    return `${symbol}${(val * rate).toFixed(4)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCost }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
