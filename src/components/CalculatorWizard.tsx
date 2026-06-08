import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
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
      className="glass-panel animate-fade-in"
      style={{ maxWidth: '650px', margin: '40px auto', padding: '32px' }}
      role="main"
      aria-label="Carbon Footprint Calculator Onboarding"
    >
      {/* Step Progress Header */}
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep].title}`}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Step {currentStep + 1} of {steps.length}
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {steps[currentStep].title}
        </span>
      </div>

      {/* Progress Bar Visual */}
      <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', marginBottom: '32px', overflow: 'hidden' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${((currentStep + 1) / steps.length) * 100}%`, 
            background: 'var(--primary)', 
            boxShadow: '0 0 8px var(--primary-glow)',
            transition: 'var(--transition-smooth)'
          }}
        />
      </div>

      {/* Step Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.2)', 
          padding: '12px', 
          borderRadius: '12px',
          color: 'var(--primary)'
        }}>
          <IconComponent size={28} aria-hidden="true" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{steps[currentStep].title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{steps[currentStep].desc}</p>
        </div>
      </div>

      {/* Screen reader announcement area */}
      <div className="sr-only" aria-live="polite">
        Current step is {steps[currentStep].title}. {steps[currentStep].desc}
      </div>

      {/* Step Form Render */}
      <div style={{ minHeight: '220px', marginBottom: '32px' }}>
        {currentStep === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="carType" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Primary Car Fuel Type
              </label>
              <select
                id="carType"
                value={answers.carType}
                onChange={(e) => updateAnswers({ carType: e.target.value as CalculatorAnswers['carType'] })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
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
                <label htmlFor="carKm" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  <span>Annual Driving Distance</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{answers.carKmPerYear.toLocaleString()} km</span>
                </label>
                <input
                  id="carKm"
                  type="range"
                  min="0"
                  max="40000"
                  step="500"
                  value={answers.carKmPerYear}
                  onChange={(e) => handleNumberChange('carKmPerYear', e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="shortFlights" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Short Flights (&lt; 3h) / yr
                </label>
                <input
                  id="shortFlights"
                  type="number"
                  min="0"
                  max="100"
                  value={answers.flightsShortPerYear}
                  onChange={(e) => handleNumberChange('flightsShortPerYear', e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label htmlFor="longFlights" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  Long Flights (&gt; 3h) / yr
                </label>
                <input
                  id="longFlights"
                  type="number"
                  min="0"
                  max="50"
                  value={answers.flightsLongPerYear}
                  onChange={(e) => handleNumberChange('flightsLongPerYear', e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="transitHours" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <span>Public Transit Usage</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{answers.publicTransitHoursPerWeek} hrs/week</span>
              </label>
              <input
                id="transitHours"
                type="range"
                min="0"
                max="50"
                step="1"
                value={answers.publicTransitHoursPerWeek}
                onChange={(e) => handleNumberChange('publicTransitHoursPerWeek', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="electricityKwh" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <span>Monthly Electricity Consumption</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{answers.electricityKwhPerMonth} kWh</span>
              </label>
              <input
                id="electricityKwh"
                type="range"
                min="0"
                max="1000"
                step="10"
                value={answers.electricityKwhPerMonth}
                onChange={(e) => handleNumberChange('electricityKwhPerMonth', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div>
              <label htmlFor="cleanRatio" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                <span>Clean/Renewable Energy Share</span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{answers.cleanEnergyRatio}%</span>
              </label>
              <input
                id="cleanRatio"
                type="range"
                min="0"
                max="100"
                step="5"
                value={answers.cleanEnergyRatio}
                onChange={(e) => handleNumberChange('cleanEnergyRatio', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div>
              <label htmlFor="heatingSource" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Primary Heating Fuel
              </label>
              <select
                id="heatingSource"
                value={answers.heatingSource}
                onChange={(e) => updateAnswers({ heatingSource: e.target.value as CalculatorAnswers['heatingSource'] })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
              >
                <option value="none">No heating</option>
                <option value="gas">Natural Gas</option>
                <option value="oil">Heating Oil</option>
                <option value="electricity">Electricity</option>
              </select>
            </div>

            {answers.heatingSource !== 'none' && (
              <div>
                <label htmlFor="heatingKwh" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  <span>Monthly Heating Consumption</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{answers.heatingKwhPerMonth} kWh</span>
                </label>
                <input
                  id="heatingKwh"
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={answers.heatingKwhPerMonth}
                  onChange={(e) => handleNumberChange('heatingKwhPerMonth', e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="dietType" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Diet Profile
              </label>
              <select
                id="dietType"
                value={answers.dietType}
                onChange={(e) => updateAnswers({ dietType: e.target.value as CalculatorAnswers['dietType'] })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
              >
                <option value="meat-heavy">Meat-heavy (Meat in most meals)</option>
                <option value="balanced">Balanced (Average meat & plant mix)</option>
                <option value="low-meat">Low-meat (Red meat rarely, poultry/fish)</option>
                <option value="vegetarian">Vegetarian (No meat, dairy/eggs okay)</option>
                <option value="vegan">Vegan (Strictly plant-based)</option>
              </select>
            </div>

            <div>
              <label htmlFor="foodWaste" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Household Food Waste Level
              </label>
              <select
                id="foodWaste"
                value={answers.foodWaste}
                onChange={(e) => updateAnswers({ foodWaste: e.target.value as CalculatorAnswers['foodWaste'] })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
              >
                <option value="high">High (Often discard unused groceries/leftovers)</option>
                <option value="medium">Medium (Occasionally discard food waste)</option>
                <option value="low">Low (Hardly discard food, make meal planning)</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="clothesPurchase" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Clothing Purchase Habits
              </label>
              <select
                id="clothesPurchase"
                value={answers.clothingPurchase}
                onChange={(e) => updateAnswers({ clothingPurchase: e.target.value as CalculatorAnswers['clothingPurchase'] })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
              >
                <option value="heavy">Frequent (Buy new items monthly, follow trends)</option>
                <option value="moderate">Moderate (Buy items as needed, replace worn clothes)</option>
                <option value="light">Infrequent (Buy second-hand, durable goods, buy rarely)</option>
              </select>
            </div>

            <div>
              <label htmlFor="electronicsPurchase" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Electronics & Gadgets Habits
              </label>
              <select
                id="electronicsPurchase"
                value={answers.electronicsPurchase}
                onChange={(e) => updateAnswers({ electronicsPurchase: e.target.value as CalculatorAnswers['electronicsPurchase'] })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
              >
                <option value="heavy">Frequent Upgrade (Always buy latest releases)</option>
                <option value="moderate">Average (Replace items when performance drops)</option>
                <option value="light">Infrequent (Keep devices until broken, buy refurbished)</option>
              </select>
            </div>

            <div>
              <label htmlFor="recyclingRate" style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                Recycling & Composting Rate
              </label>
              <select
                id="recyclingRate"
                value={answers.recyclingRate}
                onChange={(e) => updateAnswers({ recyclingRate: e.target.value as CalculatorAnswers['recyclingRate'] })}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
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
