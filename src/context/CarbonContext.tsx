/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type CalculatorAnswers, DEFAULT_ANSWERS } from '../utils/calculator';

export function getLocalYmd(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface Habit {
  id: string;
  category: 'transport' | 'energy' | 'diet' | 'consumption';
  name: string;
  description: string;
  co2Saved: number; // in kg CO2
}

export const DAILY_HABITS: Habit[] = [
  { id: 'habit-bike', category: 'transport', name: 'Commute by bike or walk', description: 'Walked or cycled instead of driving a car.', co2Saved: 3.5 },
  { id: 'habit-transit', category: 'transport', name: 'Take public transit', description: 'Used public transport (bus, train, subway).', co2Saved: 2.0 },
  { id: 'habit-carpool', category: 'transport', name: 'Carpool with others', description: 'Shared a ride to reduce single-occupant driving.', co2Saved: 1.5 },
  { id: 'habit-unplug', category: 'energy', name: 'Unplug standby devices', description: 'Turned off standby devices and power strips.', co2Saved: 0.5 },
  { id: 'habit-led', category: 'energy', name: 'Use eco-mode for appliances', description: 'Ran washing machine/dishwasher in eco/cold cycle.', co2Saved: 0.8 },
  { id: 'habit-temp', category: 'energy', name: 'Adjust thermostat by 1°C', description: 'Lowered heating or raised cooling by 1°C.', co2Saved: 1.2 },
  { id: 'habit-vegan-day', category: 'diet', name: 'Eat a fully plant-based day', description: 'Consumed zero animal products today.', co2Saved: 6.0 },
  { id: 'habit-meatless-meal', category: 'diet', name: 'Eat a vegetarian meal', description: 'Substituted meat with plant protein for one meal.', co2Saved: 2.0 },
  { id: 'habit-waste-zero', category: 'diet', name: 'Zero food waste today', description: 'Avoided wasting any food or throwing left-overs.', co2Saved: 1.0 },
  { id: 'habit-thrift', category: 'consumption', name: 'Buy second-hand / repair', description: 'Bought pre-loved item or repaired broken goods.', co2Saved: 4.0 },
  { id: 'habit-reusable', category: 'consumption', name: 'Use reusable bags/cups', description: 'Avoided single-use plastics and coffee cups.', co2Saved: 0.3 },
  { id: 'habit-recycle-all', category: 'consumption', name: 'Sort and recycle all waste', description: 'Sorted and recycled all eligible household paper/metals/plastic.', co2Saved: 0.5 }
];

export interface CarbonContextType {
  answers: CalculatorAnswers;
  isOnboarded: boolean;
  offsetAmount: number; // kg CO2 offsetted
  habitHistory: Record<string, string[]>; // dateStr -> habitIds
  updateAnswers: (newAnswers: Partial<CalculatorAnswers>) => void;
  completeOnboarding: () => void;
  resetData: () => void;
  toggleHabit: (habitId: string, dateStr: string) => void;
  addOffset: (amount: number) => void;
  getHistoryStats: () => { totalCo2Saved: number; streak: number };
}

const CarbonContext = createContext<CarbonContextType | undefined>(undefined);

const STORAGE_PREFIX = 'carbon_pulse_';

// Obfuscate local storage contents to mitigate basic local script visual snooping/tampering
function safeSetItem(key: string, value: unknown) {
  try {
    const jsonStr = JSON.stringify(value);
    const obfuscated = btoa(encodeURIComponent(jsonStr));
    localStorage.setItem(STORAGE_PREFIX + key, obfuscated);
  } catch (e) {
    console.error('Local storage set error:', e);
  }
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    const jsonStr = decodeURIComponent(atob(raw));
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error('Local storage read error:', e);
    return defaultValue;
  }
}

export const CarbonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [answers, setAnswers] = useState<CalculatorAnswers>(() => 
    safeGetItem<CalculatorAnswers>('answers', DEFAULT_ANSWERS)
  );
  
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => 
    safeGetItem<boolean>('is_onboarded', false)
  );

  const [offsetAmount, setOffsetAmount] = useState<number>(() => 
    safeGetItem<number>('offset_amount', 0)
  );

  const [habitHistory, setHabitHistory] = useState<Record<string, string[]>>(() => 
    safeGetItem<Record<string, string[]>>('habit_history', {})
  );

  // Synchronize state changes to secure local storage
  useEffect(() => {
    safeSetItem('answers', answers);
  }, [answers]);

  useEffect(() => {
    safeSetItem('is_onboarded', isOnboarded);
  }, [isOnboarded]);

  useEffect(() => {
    safeSetItem('offset_amount', offsetAmount);
  }, [offsetAmount]);

  useEffect(() => {
    safeSetItem('habit_history', habitHistory);
  }, [habitHistory]);

  const updateAnswers = (newAnswers: Partial<CalculatorAnswers>) => {
    setAnswers(prev => ({ ...prev, ...newAnswers }));
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
  };

  const resetData = () => {
    setAnswers(DEFAULT_ANSWERS);
    setIsOnboarded(false);
    setOffsetAmount(0);
    setHabitHistory({});
  };

  const toggleHabit = (habitId: string, dateStr: string) => {
    setHabitHistory(prev => {
      const currentList = prev[dateStr] || [];
      const updatedList = currentList.includes(habitId)
        ? currentList.filter(id => id !== habitId)
        : [...currentList, habitId];
      
      const newHistory = { ...prev };
      if (updatedList.length === 0) {
        delete newHistory[dateStr];
      } else {
        newHistory[dateStr] = updatedList;
      }
      return newHistory;
    });
  };

  const addOffset = (amount: number) => {
    setOffsetAmount(prev => prev + Math.max(0, amount));
  };

  const getHistoryStats = () => {
    // Calculate total CO2 saved
    let totalCo2Saved = 0;
    Object.values(habitHistory).forEach(habitIds => {
      habitIds.forEach(id => {
        const habit = DAILY_HABITS.find(h => h.id === id);
        if (habit) {
          totalCo2Saved += habit.co2Saved;
        }
      });
    });

    // Calculate daily streak (consecutive days with at least one habit completed)
    let streak = 0;
    const today = new Date();
    const todayStr = getLocalYmd(today);
    const checkDate = new Date(today);
    
    while (true) {
      const dateStr = getLocalYmd(checkDate);
      if (habitHistory[dateStr] && habitHistory[dateStr].length > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If they missed today, check if they completed yesterday. 
        // If yesterday has completions but today is empty (meaning they haven't logged today yet), the streak is preserved.
        const isToday = dateStr === todayStr;
        if (isToday) {
          // Check yesterday
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = getLocalYmd(checkDate);
          if (habitHistory[yesterdayStr] && habitHistory[yesterdayStr].length > 0) {
            // Yesterday has entries, streak continues from yesterday. Don't break yet.
            streak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
            while (true) {
              const prevStr = getLocalYmd(checkDate);
              if (habitHistory[prevStr] && habitHistory[prevStr].length > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }

    return {
      totalCo2Saved: Math.round(totalCo2Saved),
      streak
    };
  };

  return (
    <CarbonContext.Provider value={{
      answers,
      isOnboarded,
      offsetAmount,
      habitHistory,
      updateAnswers,
      completeOnboarding,
      resetData,
      toggleHabit,
      addOffset,
      getHistoryStats
    }}>
      {children}
    </CarbonContext.Provider>
  );
};

export const useCarbon = () => {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
};
