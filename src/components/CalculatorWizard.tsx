import React, { useState } from 'react';
import { useCarbon } from '../context/useCarbon';
import type { CalculatorAnswers } from '../utils/calculator';
import { Car, Zap, Utensils, ShoppingBag, ChevronRight, ChevronLeft, Award } from 'lucide-react';

export const CalculatorWizard: React.FC = () => {
  const { answers, updateAnswers, completeOnboarding } = useCarbon();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'transport', title: 'Transportation', icon: Car, desc: 'How do you commute and travel?' },
    { id: 'energy', title: 'Home Energy', icon: Zap, desc: 'What is your household energy usage?' },
    { id: 'diet', title: 'Diet & Waste', icon: Utensils, desc: 'What are your food consumption habits?' },
    { id: 'consumption', title: 'Shopping & Waste', icon: ShoppingBag, desc: 'What are your buying & recycling rates?' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Safe input handler to sanitize numbers and prevent negative/empty values
  const handleNumberChange = (key: keyof CalculatorAnswers, value: string) => {
    const parsed = parseInt(value, 10);
    const sanitized = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    updateAnswers({ [key]: sanitized });
  };

  // Render helpers
  const IconComponent = steps[currentStep].icon;

  return (
    <div 
      className="glass-panel animate-fade-in wizard-container"
      role="main"
      aria-label="Carbon Footprint Calculator Onboarding"
    >
      {/* Step Progress Header */}
      <div className="flex-between mb-24">
        <div>
          <span className="text-md color-primary font-semibold tracking-wide uppercase">
            {steps[currentStep].title}
          </span>
        </div>
        <span className="text-md color-secondary">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="wizard-progress-bar mb-32">
        <div 
          className="wizard-progress-fill"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Icon & Title */}
      <div className="flex-row items-center gap-16 mb-24">
        <div className="wizard-icon-wrapper">
          <IconComponent size={24} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-4xl mb-4">{steps[currentStep].title}</h2>
          <p className="color-secondary text-base">{steps[currentStep].desc}</p>
        </div>
      </div>

      {/* Screen reader announcement area */}
      <div className="sr-only" aria-live="polite">
        Current step is {steps[currentStep].title}. {steps[currentStep].desc}
      </div>

      {/* Step Form Render */}
      <div className="wizard-step-content mb-32">
        {currentStep === 0 && (
          <div className="flex-col gap-20">
            <div>
              <label htmlFor="carType" className="form-label mb-8">
                Primary Car Fuel Type
              </label>
              <select
                id="carType"
                value={answers.carType}
                onChange={(e) => updateAnswers({ carType: e.target.value as CalculatorAnswers['carType'] })}
                className="form-input"
              >
                <option value="none">No car / Don't drive</option>
                <option value="petrol">Petrol (Gasoline)</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric (EV)</option>
              </select>
            </div>

            {answers.carType !== 'none' && (
              <div>
                <label htmlFor="carKm" className="form-label-row mb-8">
                  <span>Annual Driving Distance</span>
                  <span className="color-primary font-semibold">{answers.carKmPerYear.toLocaleString()} km</span>
                </label>
                <input
                  id="carKm"
                  type="range"
                  min="0"
                  max="40000"
                  step="500"
                  value={answers.carKmPerYear}
                  onChange={(e) => handleNumberChange('carKmPerYear', e.target.value)}
                  className="form-slider"
                />
              </div>
            )}

            <div className="grid-2col">
              <div>
                <label htmlFor="shortFlights" className="form-label mb-8">
                  Short Flights (&lt; 3h) / yr
                </label>
                <input
                  id="shortFlights"
                  type="number"
                  min="0"
                  max="100"
                  value={answers.flightsShortPerYear}
                  onChange={(e) => handleNumberChange('flightsShortPerYear', e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="longFlights" className="form-label mb-8">
                  Long Flights (&gt; 3h) / yr
                </label>
                <input
                  id="longFlights"
                  type="number"
                  min="0"
                  max="50"
                  value={answers.flightsLongPerYear}
                  onChange={(e) => handleNumberChange('flightsLongPerYear', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="transitHours" className="form-label-row mb-8">
                <span>Public Transit Usage</span>
                <span className="color-primary font-semibold">{answers.publicTransitHoursPerWeek} hrs/week</span>
              </label>
              <input
                id="transitHours"
                type="range"
                min="0"
                max="50"
                step="1"
                value={answers.publicTransitHoursPerWeek}
                onChange={(e) => handleNumberChange('publicTransitHoursPerWeek', e.target.value)}
                className="form-slider"
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="flex-col gap-20">
            <div>
              <label htmlFor="electricityKwh" className="form-label-row mb-8">
                <span>Monthly Electricity Consumption</span>
                <span className="color-primary font-semibold">{answers.electricityKwhPerMonth} kWh</span>
              </label>
              <input
                id="electricityKwh"
                type="range"
                min="0"
                max="1000"
                step="10"
                value={answers.electricityKwhPerMonth}
                onChange={(e) => handleNumberChange('electricityKwhPerMonth', e.target.value)}
                className="form-slider"
              />
            </div>

            <div>
              <label htmlFor="cleanRatio" className="form-label-row mb-8">
                <span>Clean/Renewable Energy Share</span>
                <span className="color-primary font-semibold">{answers.cleanEnergyRatio}%</span>
              </label>
              <input
                id="cleanRatio"
                type="range"
                min="0"
                max="100"
                step="5"
                value={answers.cleanEnergyRatio}
                onChange={(e) => handleNumberChange('cleanEnergyRatio', e.target.value)}
                className="form-slider"
              />
            </div>

            <div>
              <label htmlFor="heatingSource" className="form-label mb-8">
                Primary Heating Fuel
              </label>
              <select
                id="heatingSource"
                value={answers.heatingSource}
                onChange={(e) => updateAnswers({ heatingSource: e.target.value as CalculatorAnswers['heatingSource'] })}
                className="form-input"
              >
                <option value="none">No heating</option>
                <option value="gas">Natural Gas</option>
                <option value="oil">Heating Oil</option>
                <option value="electricity">Electricity</option>
              </select>
            </div>

            {answers.heatingSource !== 'none' && (
              <div>
                <label htmlFor="heatingKwh" className="form-label-row mb-8">
                  <span>Monthly Heating Consumption</span>
                  <span className="color-primary font-semibold">{answers.heatingKwhPerMonth} kWh</span>
                </label>
                <input
                  id="heatingKwh"
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={answers.heatingKwhPerMonth}
                  onChange={(e) => handleNumberChange('heatingKwhPerMonth', e.target.value)}
                  className="form-slider"
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex-col gap-20">
            <div>
              <label htmlFor="dietType" className="form-label mb-8">
                Diet Profile
              </label>
              <select
                id="dietType"
                value={answers.dietType}
                onChange={(e) => updateAnswers({ dietType: e.target.value as CalculatorAnswers['dietType'] })}
                className="form-input"
              >
                <option value="meat-heavy">Meat-heavy (Meat in most meals)</option>
                <option value="balanced">Balanced (Average meat &amp; plant mix)</option>
                <option value="low-meat">Low-meat (Red meat rarely, poultry/fish)</option>
                <option value="vegetarian">Vegetarian (No meat, dairy/eggs okay)</option>
                <option value="vegan">Vegan (Strictly plant-based)</option>
              </select>
            </div>

            <div>
              <label htmlFor="foodWaste" className="form-label mb-8">
                Household Food Waste Level
              </label>
              <select
                id="foodWaste"
                value={answers.foodWaste}
                onChange={(e) => updateAnswers({ foodWaste: e.target.value as CalculatorAnswers['foodWaste'] })}
                className="form-input"
              >
                <option value="high">High (Often discard unused groceries/leftovers)</option>
                <option value="medium">Medium (Occasionally discard food waste)</option>
                <option value="low">Low (Hardly discard food, make meal planning)</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex-col gap-20">
            <div>
              <label htmlFor="clothesPurchase" className="form-label mb-8">
                Clothing Purchase Habits
              </label>
              <select
                id="clothesPurchase"
                value={answers.clothingPurchase}
                onChange={(e) => updateAnswers({ clothingPurchase: e.target.value as CalculatorAnswers['clothingPurchase'] })}
                className="form-input"
              >
                <option value="heavy">Frequent (Buy new items monthly, follow trends)</option>
                <option value="moderate">Moderate (Buy items as needed, replace worn clothes)</option>
                <option value="light">Infrequent (Buy second-hand, durable goods, buy rarely)</option>
              </select>
            </div>

            <div>
              <label htmlFor="electronicsPurchase" className="form-label mb-8">
                Electronics &amp; Gadgets Habits
              </label>
              <select
                id="electronicsPurchase"
                value={answers.electronicsPurchase}
                onChange={(e) => updateAnswers({ electronicsPurchase: e.target.value as CalculatorAnswers['electronicsPurchase'] })}
                className="form-input"
              >
                <option value="heavy">Frequent Upgrade (Always buy latest releases)</option>
                <option value="moderate">Average (Replace items when performance drops)</option>
                <option value="light">Infrequent (Keep devices until broken, buy refurbished)</option>
              </select>
            </div>

            <div>
              <label htmlFor="recyclingRate" className="form-label mb-8">
                Recycling &amp; Composting Rate
              </label>
              <select
                id="recyclingRate"
                value={answers.recyclingRate}
                onChange={(e) => updateAnswers({ recyclingRate: e.target.value as CalculatorAnswers['recyclingRate'] })}
                className="form-input"
              >
                <option value="none">None (Discard everything into trash bin)</option>
                <option value="some">Some (Recycle paper/cardboard sometimes)</option>
                <option value="most">Most (Recycle paper, glass, plastic, compost organic waste)</option>
                <option value="all">Complete (Strictly separate waste, near-zero landfill waste)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Action Buttons */}
      <div className="flex-between gap-16">
        <button
          className="btn btn-secondary"
          onClick={handleBack}
          disabled={currentStep === 0}
          aria-label="Previous step"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          Back
        </button>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          aria-label={currentStep === steps.length - 1 ? "Calculate Carbon Footprint" : "Next step"}
        >
          {currentStep === steps.length - 1 ? (
            <>
              Calculate Footprint
              <Award size={18} aria-hidden="true" />
            </>
          ) : (
            <>
              Next
              <ChevronRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
