import React, { useState, useEffect, useCallback } from 'react';
import { type CalculatorAnswers, DEFAULT_ANSWERS } from '../utils/calculator';
import { getLocalYmd, DAILY_HABITS, CarbonContext } from './carbonHelpers';

const STORAGE_PREFIX = 'carbon_pulse_';

// Obfuscate local storage contents to mitigate basic local script visual snooping/tampering
function safeSetItem(key: string, value: unknown): void {
  try {
    const jsonStr = JSON.stringify(value);
    const obfuscated = btoa(encodeURIComponent(jsonStr));
    localStorage.setItem(STORAGE_PREFIX + key, obfuscated);
  } catch {
    // Storage quota exceeded or unavailable — silently degrade
  }
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    const jsonStr = decodeURIComponent(atob(raw));
    return JSON.parse(jsonStr) as T;
  } catch {
    // Corrupted or tampered data — return safe default
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

  const updateAnswers = useCallback((newAnswers: Partial<CalculatorAnswers>) => {
    setAnswers(prev => ({ ...prev, ...newAnswers }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsOnboarded(true);
  }, []);

  const resetData = useCallback(() => {
    setAnswers(DEFAULT_ANSWERS);
    setIsOnboarded(false);
    setOffsetAmount(0);
    setHabitHistory({});
  }, []);

  const toggleHabit = useCallback((habitId: string, dateStr: string) => {
    setHabitHistory(prev => {
      const currentList = prev[dateStr] || [];
      const updatedList = currentList.includes(habitId)
        ? currentList.filter(id => id !== habitId)
        : [...currentList, habitId];

      if (updatedList.length === 0) {
        // Build new object excluding the empty date key (avoids mutable delete operator)
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== dateStr)
        );
      }
      return { ...prev, [dateStr]: updatedList };
    });
  }, []);

  const addOffset = useCallback((amount: number) => {
    setOffsetAmount(prev => prev + Math.max(0, amount));
  }, []);

  const getHistoryStats = useCallback(() => {
    // Calculate total CO2 saved using a lookup map for O(1) habit resolution
    const habitMap = new Map(DAILY_HABITS.map(h => [h.id, h.co2Saved]));
    let totalCo2Saved = 0;
    for (const habitIds of Object.values(habitHistory)) {
      for (const id of habitIds) {
        totalCo2Saved += habitMap.get(id) ?? 0;
      }
    }

    // Calculate daily streak (consecutive days with at least one habit completed)
    // Bounded loop prevents runaway iteration — max 365 days lookback
    const MAX_STREAK_LOOKBACK = 365;
    let streak = 0;
    const today = new Date();
    const todayStr = getLocalYmd(today);
    const checkDate = new Date(today);

    const hasEntries = (dateStr: string): boolean => {
      const entries = habitHistory[dateStr];
      return Array.isArray(entries) && entries.length > 0;
    };

    // Check if today has entries
    if (hasEntries(todayStr)) {
      // Count streak starting from today
      for (let i = 0; i < MAX_STREAK_LOOKBACK; i++) {
        const dateStr = getLocalYmd(checkDate);
        if (hasEntries(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Today has no entries — check if yesterday starts a streak
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = getLocalYmd(checkDate);
      if (hasEntries(yesterdayStr)) {
        for (let i = 0; i < MAX_STREAK_LOOKBACK; i++) {
          const dateStr = getLocalYmd(checkDate);
          if (hasEntries(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return {
      totalCo2Saved: Math.round(totalCo2Saved),
      streak
    };
  }, [habitHistory]);

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
