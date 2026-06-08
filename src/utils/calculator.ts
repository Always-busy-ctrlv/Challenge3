export interface CalculatorAnswers {
  carKmPerYear: number;
  carType: 'electric' | 'hybrid' | 'petrol' | 'diesel' | 'none';
  flightsShortPerYear: number;
  flightsLongPerYear: number;
  publicTransitHoursPerWeek: number;
  
  electricityKwhPerMonth: number;
  cleanEnergyRatio: number; // 0 to 100
  heatingSource: 'gas' | 'electricity' | 'oil' | 'none';
  heatingKwhPerMonth: number;
  
  dietType: 'meat-heavy' | 'balanced' | 'low-meat' | 'vegetarian' | 'vegan';
  foodWaste: 'high' | 'medium' | 'low';
  
  clothingPurchase: 'heavy' | 'moderate' | 'light';
  electronicsPurchase: 'heavy' | 'moderate' | 'light';
  recyclingRate: 'none' | 'some' | 'most' | 'all';
}

export const DEFAULT_ANSWERS: CalculatorAnswers = {
  carKmPerYear: 8000,
  carType: 'petrol',
  flightsShortPerYear: 2,
  flightsLongPerYear: 0,
  publicTransitHoursPerWeek: 3,
  electricityKwhPerMonth: 250,
  cleanEnergyRatio: 10,
  heatingSource: 'gas',
  heatingKwhPerMonth: 150,
  dietType: 'balanced',
  foodWaste: 'medium',
  clothingPurchase: 'moderate',
  electronicsPurchase: 'moderate',
  recyclingRate: 'some'
};

// EPA and EEA based emission factors (kg CO2 per unit, annualized where noted)
export const EMISSION_FACTORS = {
  car: {
    petrol: 0.17,   // kg CO2 / km
    diesel: 0.19,   // kg CO2 / km
    hybrid: 0.10,   // kg CO2 / km
    electric: 0.05, // kg CO2 / km (grid average for EV charging)
    none: 0
  },
  flights: {
    short: 150, // kg CO2 / short flight (< 3h)
    long: 800   // kg CO2 / long flight (> 3h)
  },
  publicTransit: {
    hourlyFactor: 1.2 // kg CO2 / hour (assuming average bus/train speed/emissions)
  },
  grid: {
    electricityCo2PerKwh: 0.4 // kg CO2 / kWh
  },
  heating: {
    gas: 0.20,         // kg CO2 / kWh
    oil: 0.27,         // kg CO2 / kWh
    electricity: 0.40, // kg CO2 / kWh (scaled by clean energy ratio)
    none: 0
  },
  diet: {
    'meat-heavy': 3000, // kg CO2 / year
    balanced: 2000,     // kg CO2 / year
    'low-meat': 1500,   // kg CO2 / year
    vegetarian: 1200,   // kg CO2 / year
    vegan: 800          // kg CO2 / year
  },
  foodWaste: {
    high: 300,   // kg CO2 / year
    medium: 100, // kg CO2 / year
    low: 0       // kg CO2 / year
  },
  clothing: {
    heavy: 800,    // kg CO2 / year
    moderate: 400, // kg CO2 / year
    light: 150     // kg CO2 / year
  },
  electronics: {
    heavy: 500,    // kg CO2 / year
    moderate: 250, // kg CO2 / year
    light: 80      // kg CO2 / year
  },
  recycling: {
    all: -200,   // kg CO2 / year saved
    most: -100,  // kg CO2 / year saved
    some: -50,   // kg CO2 / year saved
    none: 0      // kg CO2 / year saved
  }
};

/**
 * Calculates annual transportation emissions in kg CO2
 */
export function calculateTransportEmissions(answers: CalculatorAnswers): number {
  const carEmissions = answers.carKmPerYear * EMISSION_FACTORS.car[answers.carType];
  const flightEmissions = (answers.flightsShortPerYear * EMISSION_FACTORS.flights.short) +
                          (answers.flightsLongPerYear * EMISSION_FACTORS.flights.long);
  const transitEmissions = answers.publicTransitHoursPerWeek * EMISSION_FACTORS.publicTransit.hourlyFactor * 52; // 52 weeks
  return Math.round(carEmissions + flightEmissions + transitEmissions);
}

/**
 * Calculates annual energy emissions in kg CO2
 */
export function calculateEnergyEmissions(answers: CalculatorAnswers): number {
  const cleanEnergyMultiplier = Math.max(0, 1 - answers.cleanEnergyRatio / 100);
  const electricityEmissions = (answers.electricityKwhPerMonth * 12) * 
                                EMISSION_FACTORS.grid.electricityCo2PerKwh * 
                                cleanEnergyMultiplier;

  let heatingFactor = EMISSION_FACTORS.heating[answers.heatingSource];
  if (answers.heatingSource === 'electricity') {
    heatingFactor = heatingFactor * cleanEnergyMultiplier;
  }
  const heatingEmissions = (answers.heatingKwhPerMonth * 12) * heatingFactor;

  return Math.round(electricityEmissions + heatingEmissions);
}

/**
 * Calculates annual diet-based emissions in kg CO2
 */
export function calculateDietEmissions(answers: CalculatorAnswers): number {
  const baseDiet = EMISSION_FACTORS.diet[answers.dietType];
  const wasteAddition = EMISSION_FACTORS.foodWaste[answers.foodWaste];
  return Math.round(baseDiet + wasteAddition);
}

/**
 * Calculates annual consumption emissions in kg CO2
 */
export function calculateConsumptionEmissions(answers: CalculatorAnswers): number {
  const clothing = EMISSION_FACTORS.clothing[answers.clothingPurchase];
  const electronics = EMISSION_FACTORS.electronics[answers.electronicsPurchase];
  const recyclingDiscount = EMISSION_FACTORS.recycling[answers.recyclingRate];
  
  // Emissions cannot be negative
  return Math.round(Math.max(0, clothing + electronics + recyclingDiscount));
}

/**
 * Calculates total annual emissions in kg CO2
 */
export function calculateTotalEmissions(answers: CalculatorAnswers): number {
  return calculateTransportEmissions(answers) +
         calculateEnergyEmissions(answers) +
         calculateDietEmissions(answers) +
         calculateConsumptionEmissions(answers);
}
