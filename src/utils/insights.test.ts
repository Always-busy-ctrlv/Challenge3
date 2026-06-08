import { describe, it, expect } from 'vitest';
import { generateInsights } from './insights';
import type { CalculatorAnswers } from './calculator';

describe('Insights engine generator', () => {
  const baseAnswers: CalculatorAnswers = {
    carKmPerYear: 0,
    carType: 'none',
    flightsShortPerYear: 0,
    flightsLongPerYear: 0,
    publicTransitHoursPerWeek: 0,
    electricityKwhPerMonth: 0,
    cleanEnergyRatio: 100,
    heatingSource: 'none',
    heatingKwhPerMonth: 0,
    dietType: 'vegan',
    foodWaste: 'low',
    clothingPurchase: 'light',
    electronicsPurchase: 'light',
    recyclingRate: 'all'
  };

  it('returns an empty array when user footprint is already optimized', () => {
    const insights = generateInsights(baseAnswers);
    expect(insights).toEqual([]);
  });

  describe('Transport insights', () => {
    it('generates EV recommendation for high petrol driving', () => {
      const answers: CalculatorAnswers = {
        ...baseAnswers,
        carKmPerYear: 10000,
        carType: 'petrol'
      };
      const insights = generateInsights(answers);
      const evInsight = insights.find(i => i.id === 'transport-ev');
      
      expect(evInsight).toBeDefined();
      expect(evInsight?.category).toBe('transport');
      expect(evInsight?.potentialSaving).toBe(Math.round(10000 * 0.17 - 10000 * 0.05)); // petrol - electric
      expect(evInsight?.actionType).toBe('Vehicle Upgrade');
    });

    it('generates flight optimization recommendation for frequent flyers', () => {
      const answers: CalculatorAnswers = {
        ...baseAnswers,
        flightsShortPerYear: 4,
        flightsLongPerYear: 1
      };
      const insights = generateInsights(answers);
      const flightInsight = insights.find(i => i.id === 'transport-flights');
      
      expect(flightInsight).toBeDefined();
      expect(flightInsight?.category).toBe('transport');
      const expectedSaving = Math.round(((4 * 150) + (1 * 800)) * 0.5);
      expect(flightInsight?.potentialSaving).toBe(expectedSaving);
    });
  });

  describe('Energy insights', () => {
    it('generates clean energy provider recommendations for high grid electric usage', () => {
      const answers: CalculatorAnswers = {
        ...baseAnswers,
        electricityKwhPerMonth: 300,
        cleanEnergyRatio: 20
      };
      const insights = generateInsights(answers);
      const cleanEnergyInsight = insights.find(i => i.id === 'energy-clean');
      
      expect(cleanEnergyInsight).toBeDefined();
      expect(cleanEnergyInsight?.category).toBe('energy');
      const expectedSaving = Math.round((300 * 12) * 0.4 * 0.8);
      expect(cleanEnergyInsight?.potentialSaving).toBe(expectedSaving);
    });

    it('generates heating upgrade recommendation for gas heaters', () => {
      const answers: CalculatorAnswers = {
        ...baseAnswers,
        heatingSource: 'gas',
        heatingKwhPerMonth: 200
      };
      const insights = generateInsights(answers);
      const heatingInsight = insights.find(i => i.id === 'energy-heating');
      
      expect(heatingInsight).toBeDefined();
      expect(heatingInsight?.category).toBe('energy');
      const heatingEmissions = (200 * 12) * 0.20;
      const targetEmissions = ((200 * 12) / 3) * 0.40 * 0.5;
      expect(heatingInsight?.potentialSaving).toBe(Math.round(heatingEmissions - targetEmissions));
    });
  });

  describe('Diet insights', () => {
    it('generates meat reduction recommendation for meat-heavy diets', () => {
      const answers: CalculatorAnswers = {
        ...baseAnswers,
        dietType: 'meat-heavy'
      };
      const insights = generateInsights(answers);
      const meatInsight = insights.find(i => i.id === 'diet-reduce-meat');
      
      expect(meatInsight).toBeDefined();
      expect(meatInsight?.potentialSaving).toBe(1500); // meat-heavy (3000) - low-meat (1500)
    });

    it('generates food waste recommendations for high waste profiles', () => {
      const answers: CalculatorAnswers = {
        ...baseAnswers,
        foodWaste: 'high'
      };
      const insights = generateInsights(answers);
      const wasteInsight = insights.find(i => i.id === 'diet-food-waste');
      
      expect(wasteInsight).toBeDefined();
      expect(wasteInsight?.potentialSaving).toBe(300); // high (300) - low (0)
    });
  });

  describe('Consumption insights', () => {
    it('generates fashion advice for heavy shoppers', () => {
      const answers: CalculatorAnswers = {
        ...baseAnswers,
        clothingPurchase: 'heavy'
      };
      const insights = generateInsights(answers);
      const fashionInsight = insights.find(i => i.id === 'consumption-clothes');
      
      expect(fashionInsight).toBeDefined();
      expect(fashionInsight?.potentialSaving).toBe(650); // heavy (800) - light (150)
    });

    it('generates recycling tips for non-recyclers', () => {
      const answers: CalculatorAnswers = {
        ...baseAnswers,
        recyclingRate: 'none'
      };
      const insights = generateInsights(answers);
      const recycleInsight = insights.find(i => i.id === 'consumption-recycle');
      
      expect(recycleInsight).toBeDefined();
      expect(recycleInsight?.potentialSaving).toBe(200); // saved by shifting none (0) to all (200)
    });
  });

  it('sorts insights in descending order of potential CO2 savings', () => {
    const answers: CalculatorAnswers = {
      ...baseAnswers,
      carKmPerYear: 8000,
      carType: 'petrol', // potential saving: 960 kg
      electricityKwhPerMonth: 250,
      cleanEnergyRatio: 10, // potential saving: 1080 kg
      dietType: 'meat-heavy' // potential saving: 1500 kg
    };
    
    const insights = generateInsights(answers);
    
    expect(insights.length).toBeGreaterThan(1);
    for (let i = 0; i < insights.length - 1; i++) {
      expect(insights[i].potentialSaving).toBeGreaterThanOrEqual(insights[i+1].potentialSaving);
    }
  });

  it('generates EV recommendation for high diesel driving', () => {
    const answers: CalculatorAnswers = {
      ...baseAnswers,
      carKmPerYear: 10000,
      carType: 'diesel'
    };
    const insights = generateInsights(answers);
    const evInsight = insights.find(i => i.id === 'transport-ev');
    
    expect(evInsight).toBeDefined();
    expect(evInsight?.description).toContain('diesel');
    expect(evInsight?.potentialSaving).toBe(Math.round(10000 * 0.19 - 10000 * 0.05));
  });

  it('does not generate heating insight when potential saving is 100 kg or less', () => {
    const answers: CalculatorAnswers = {
      ...baseAnswers,
      heatingSource: 'gas',
      heatingKwhPerMonth: 50 // saving is ~80 kg (<= 100)
    };
    const insights = generateInsights(answers);
    const heatingInsight = insights.find(i => i.id === 'energy-heating');
    expect(heatingInsight).toBeUndefined();
  });
});
