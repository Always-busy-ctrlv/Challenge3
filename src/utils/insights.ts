import { type CalculatorAnswers, EMISSION_FACTORS } from './calculator';

export interface Insight {
  id: string;
  category: 'transport' | 'energy' | 'diet' | 'consumption';
  title: string;
  description: string;
  potentialSaving: number; // in kg CO2/year
  actionType: string;
}

/**
 * Generates personalized insights and potential CO2 savings based on user inputs
 */
export function generateInsights(answers: CalculatorAnswers): Insight[] {
  const insights: Insight[] = [];

  // --- Transport Insights ---
  if (answers.carKmPerYear > 3000 && (answers.carType === 'petrol' || answers.carType === 'diesel')) {
    const currentEmissions = answers.carKmPerYear * EMISSION_FACTORS.car[answers.carType];
    const targetEmissions = answers.carKmPerYear * EMISSION_FACTORS.car.electric;
    const saving = Math.round(currentEmissions - targetEmissions);

    insights.push({
      id: 'transport-ev',
      category: 'transport',
      title: 'Consider transitioning to an electric or hybrid vehicle',
      description: `Switching your ${answers.carType} car to an electric vehicle would save up to ${saving.toLocaleString()} kg of CO₂ per year based on your annual driving of ${answers.carKmPerYear.toLocaleString()} km.`,
      potentialSaving: saving,
      actionType: 'Vehicle Upgrade'
    });
  }

  if (answers.flightsShortPerYear > 2 || answers.flightsLongPerYear > 0) {
    const flightEmissions = (answers.flightsShortPerYear * EMISSION_FACTORS.flights.short) +
                            (answers.flightsLongPerYear * EMISSION_FACTORS.flights.long);
    // Assume we can target a 50% reduction in flights through virtual meetings or train travel
    const saving = Math.round(flightEmissions * 0.5);

    insights.push({
      id: 'transport-flights',
      category: 'transport',
      title: 'Optimize air travel and replace short flights',
      description: 'Taking high-speed trains for shorter distances or reducing non-essential flights by 50% can dramatically shrink your footprint.',
      potentialSaving: saving,
      actionType: 'Travel Optimization'
    });
  }

  // --- Energy Insights ---
  if (answers.electricityKwhPerMonth > 150 && answers.cleanEnergyRatio < 80) {
    const annualElectricity = answers.electricityKwhPerMonth * 12;
    const currentEmissions = annualElectricity * EMISSION_FACTORS.grid.electricityCo2PerKwh * (1 - answers.cleanEnergyRatio / 100);
    // Transition to 100% clean energy
    const saving = Math.round(currentEmissions);

    insights.push({
      id: 'energy-clean',
      category: 'energy',
      title: 'Switch to a 100% clean energy provider',
      description: 'Switching your electricity plan to green energy (solar, wind) or installing solar panels would instantly reduce your home power emissions to zero.',
      potentialSaving: saving,
      actionType: 'Green Energy Switch'
    });
  }

  if (answers.heatingSource === 'gas' || answers.heatingSource === 'oil') {
    const heatingEmissions = (answers.heatingKwhPerMonth * 12) * EMISSION_FACTORS.heating[answers.heatingSource];
    // Switch to heat pump (electric heating divided by COP of 3, with 50% clean energy ratio average)
    const targetEmissions = ((answers.heatingKwhPerMonth * 12) / 3) * EMISSION_FACTORS.heating.electricity * 0.5;
    const saving = Math.max(0, Math.round(heatingEmissions - targetEmissions));

    if (saving > 100) {
      insights.push({
        id: 'energy-heating',
        category: 'energy',
        title: 'Upgrade to an electric heat pump',
        description: `Transitioning from ${answers.heatingSource} heating to a modern electric heat pump system can save approximately ${saving.toLocaleString()} kg of CO₂ annually.`,
        potentialSaving: saving,
        actionType: 'Heating Retrofit'
      });
    }
  }

  // --- Diet Insights ---
  if (answers.dietType === 'meat-heavy' || answers.dietType === 'balanced') {
    const currentDiet = EMISSION_FACTORS.diet[answers.dietType];
    const targetDiet = EMISSION_FACTORS.diet['low-meat'];
    const saving = Math.round(currentDiet - targetDiet);

    insights.push({
      id: 'diet-reduce-meat',
      category: 'diet',
      title: 'Incorporate more plant-based meals',
      description: `Reducing red meat consumption to match a 'low-meat' diet would save around ${saving.toLocaleString()} kg of CO₂ per year and reduce agricultural land-use impact.`,
      potentialSaving: saving,
      actionType: 'Dietary Shift'
    });
  }

  if (answers.foodWaste === 'high' || answers.foodWaste === 'medium') {
    const currentWaste = EMISSION_FACTORS.foodWaste[answers.foodWaste];
    const targetWaste = EMISSION_FACTORS.foodWaste.low;
    const saving = Math.round(currentWaste - targetWaste);

    insights.push({
      id: 'diet-food-waste',
      category: 'diet',
      title: 'Minimize food waste by planning meals',
      description: 'Buying only what is needed, composting organic waste, and storing foods correctly reduces landfill methane emissions.',
      potentialSaving: saving,
      actionType: 'Zero-Waste Habits'
    });
  }

  // --- Consumption Insights ---
  if (answers.clothingPurchase === 'heavy' || answers.clothingPurchase === 'moderate') {
    const currentClothing = EMISSION_FACTORS.clothing[answers.clothingPurchase];
    const targetClothing = EMISSION_FACTORS.clothing.light;
    const saving = Math.round(currentClothing - targetClothing);

    insights.push({
      id: 'consumption-clothes',
      category: 'consumption',
      title: 'Embrace slow fashion and second-hand shopping',
      description: 'Buying pre-loved clothes or prioritizing high-quality, durable garments cuts down supply chain manufacturing waste.',
      potentialSaving: saving,
      actionType: 'Sustainable Fashion'
    });
  }

  if (answers.recyclingRate === 'none' || answers.recyclingRate === 'some') {
    const currentRecycle = EMISSION_FACTORS.recycling[answers.recyclingRate];
    const targetRecycle = EMISSION_FACTORS.recycling.all;
    const saving = Math.round(targetRecycle - currentRecycle); // saving is absolute value subtraction since recycling saves CO2

    insights.push({
      id: 'consumption-recycle',
      category: 'consumption',
      title: 'Establish a household recycling system',
      description: 'Sorting plastics, metals, and cardboard prevents raw resource mining emissions and keeps reusable materials out of landfills.',
      potentialSaving: Math.abs(saving),
      actionType: 'Recycling Habit'
    });
  }

  // Sort insights by potential saving (highest first)
  return insights.sort((a, b) => b.potentialSaving - a.potentialSaving);
}
