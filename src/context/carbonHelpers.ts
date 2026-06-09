import { createContext } from 'react';
import type { CalculatorAnswers } from '../utils/calculator';

/**
 * Formats a Date object into a locale-safe 'YYYY-MM-DD' string.
 */
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
  offsetAmount: number;
  habitHistory: Record<string, string[]>;
  updateAnswers: (newAnswers: Partial<CalculatorAnswers>) => void;
  completeOnboarding: () => void;
  resetData: () => void;
  toggleHabit: (habitId: string, dateStr: string) => void;
  addOffset: (amount: number) => void;
  getHistoryStats: () => { totalCo2Saved: number; streak: number };
}

export const CarbonContext = createContext<CarbonContextType | undefined>(undefined);
