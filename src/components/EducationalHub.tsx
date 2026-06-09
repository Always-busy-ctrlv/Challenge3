import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCarbon } from '../context/useCarbon';
import { Shield, Sprout, DollarSign } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  type: string;
  costPerTonne: number; // in USD
  co2SavedPerDollar: number; // kg per USD
  description: string;
}

const OFFSET_PROJECTS: Project[] = [
  {
    id: 'proj-trees',
    name: 'Amazon Rainforest Protection',
    type: 'Reforestation & Forestry',
    costPerTonne: 15,
    co2SavedPerDollar: 66.7, // 1000 / 15
    description: 'Sponsor certified native tree planting and land protection in the Amazon basin to recapture carbon naturally.'
  },
  {
    id: 'proj-wind',
    name: 'Global Wind Energy Farms',
    type: 'Renewable energy infrastructure',
    costPerTonne: 8,
    co2SavedPerDollar: 125.0, // 1000 / 8
    description: 'Fund certified clean wind energy grids replacing fossil fuel energy in developing rural communities.'
  },
  {
    id: 'proj-water',
    name: 'Clean Water Purification',
    type: 'Community & Hygiene',
    costPerTonne: 12,
    co2SavedPerDollar: 83.3, // 1000 / 12
    description: 'Provide water filter systems to remote villages, eliminating the need to burn wood for boiling drinking water.'
  }
];

export const EducationalHub: React.FC = () => {
  const { offsetAmount, addOffset } = useCarbon();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(OFFSET_PROJECTS[0].id);
  const [inputAmount, setInputAmount] = useState<string>('250');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const activeProject = OFFSET_PROJECTS.find(p => p.id === selectedProjectId) || OFFSET_PROJECTS[0];

  const parsedAmount = parseInt(inputAmount, 10);
  const sanitizedAmount = isNaN(parsedAmount) || parsedAmount < 0 ? 0 : parsedAmount;

  // Calculate cost (1 tonne = 1000 kg)
  const simulatedCost = (sanitizedAmount / 1000) * activeProject.costPerTonne;

  // Use a ref to track the timeout ID for proper cleanup
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup the success timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const handleOffsetSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (sanitizedAmount > 0) {
      addOffset(sanitizedAmount);
      setShowSuccess(true);
      // Clear any existing timer before starting a new one
      if (successTimerRef.current !== null) {
        clearTimeout(successTimerRef.current);
      }
      successTimerRef.current = setTimeout(() => {
        setShowSuccess(false);
        successTimerRef.current = null;
      }, 3000);
    }
  }, [sanitizedAmount, addOffset]);

  const setAmountPreset = useCallback((preset: number) => {
    setInputAmount(preset.toString());
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Carbon Offsetting Hub</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Neutralize unavoidable emissions by funding verified environmental initiatives.
        </p>
      </div>

      {/* Educational info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px' }}>
          <div style={{ color: 'var(--primary)' }}><Shield size={20} aria-hidden="true" /></div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Verified Standards</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All projects are certified by Gold Standard or Verra VCS.</p>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--card-border)', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px' }}>
          <div style={{ color: 'var(--primary)' }}><Sprout size={20} aria-hidden="true" /></div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Add Bio-diversity</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Funding directly supports local ecosystems and wildlife conservation.</p>
          </div>
        </div>
      </div>

      {/* Simulator Form */}
      <form 
        onSubmit={handleOffsetSubmit}
        style={{
          borderTop: '1px solid var(--card-border)',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Offset Simulator</h4>

        {/* Project Selector */}
        <div>
          <label htmlFor="offsetProj" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Choose Environmental Project
          </label>
          <select
            id="offsetProj"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
          >
            {OFFSET_PROJECTS.map(proj => (
              <option key={proj.id} value={proj.id}>
                {proj.name} (${proj.costPerTonne}/tonne)
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
          <strong>{activeProject.type}:</strong> {activeProject.description}
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="offsetKg" style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Amount to Offset (kg CO₂)
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              id="offsetKg"
              type="number"
              min="1"
              max="50000"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', color: '#fff', outline: 'none' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sanitizedAmount <= 0}
            >
              Simulate Purchase
            </button>
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setAmountPreset(100)}>+100 kg</button>
            <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setAmountPreset(500)}>+500 kg</button>
            <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => setAmountPreset(1000)}>+1,000 kg</button>
          </div>
        </div>

        {/* Live Calculation Display */}
        {sanitizedAmount > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(16, 185, 129, 0.03)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem' }}>Estimated Cost: <strong>${simulatedCost.toFixed(2)}</strong></span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ({(sanitizedAmount / 1000).toFixed(2)} Tonnes offset)
            </span>
          </div>
        )}

        {/* Current offset statistics */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--card-border)', paddingTop: '16px', marginTop: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Your Total Offset Level:</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>
            {offsetAmount.toLocaleString()} kg CO₂
          </span>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <div 
            className="animate-fade-in"
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--primary)',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
            role="alert"
          >
            Thank you! Successfully logged {sanitizedAmount.toLocaleString()} kg carbon offset.
          </div>
        )}
      </form>
    </div>
  );
};
