import React from 'react';
import { useCarbon } from '../context/CarbonContext';
import { calculateTotalEmissions } from '../utils/calculator';
import { Flame, ShieldAlert, Award, RefreshCw } from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { answers, offsetAmount, getHistoryStats, resetData } = useCarbon();
  
  const grossEmissions = calculateTotalEmissions(answers);
  const netEmissions = Math.max(0, grossEmissions - offsetAmount);
  
  const { totalCo2Saved, streak } = getHistoryStats();

  // Global target is 2,000 kg (2.0 Tonnes) per person annually
  const budgetTarget = 2000;
  const budgetPercent = Math.min(100, Math.round((netEmissions / budgetTarget) * 100));
  const isOverBudget = netEmissions > budgetTarget;

  // SVG ring calculations
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI; // ~201.06
  const strokeDashoffset = circumference - (budgetPercent / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Row */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap', 
          gap: '20px',
          borderLeft: '4px solid var(--primary)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Live Performance
          </span>
          <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>CarbonPulse Dashboard</h2>
        </div>
        
        <button 
          className="btn btn-danger" 
          onClick={resetData}
          style={{ padding: '8px 16px', fontSize: '0.8rem' }}
          aria-label="Reset all carbon footprint data"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Reset Profile
        </button>
      </div>

      {/* Hero Stats Row: Ring + Category Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Budget Circular Ring Visualizer */}
        <div className="glass-panel animate-glow" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <svg height="120" width="120" style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
              {/* Background ring */}
              <circle
                stroke="rgba(255, 255, 255, 0.03)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="60"
                cy="60"
              />
              {/* Dynamic progress ring */}
              <circle
                stroke={isOverBudget ? 'var(--accent-red)' : 'var(--primary)'}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                r={normalizedRadius}
                cx="60"
                cy="60"
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {budgetPercent}%
              </span>
              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Budget
              </span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isOverBudget ? (
                <>
                  <ShieldAlert size={18} color="var(--accent-red)" aria-hidden="true" />
                  Above Target Limit
                </>
              ) : (
                <>
                  <Award size={18} color="var(--primary)" aria-hidden="true" />
                  Eco-Target Compliant
                </>
              )}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '6px', lineHeight: 1.4 }}>
              {isOverBudget 
                ? `Your net emissions exceed the sustainable target of ${budgetTarget.toLocaleString()} kg/yr. Adopt daily habits to reduce.` 
                : `Awesome! Your net footprint remains within the global carbon budget target of ${budgetTarget.toLocaleString()} kg/yr.`
              }
            </p>
          </div>
        </div>

        {/* Numeric stats cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gross Footprint</span>
            <div>
              <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 700 }}>
                {grossEmissions.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kg CO₂ / year</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Offsets Logged</span>
            <div>
              <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                -{offsetAmount.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kg CO₂ offset</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Net Emissions</span>
            <div>
              <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 700 }}>
                {netEmissions.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kg CO₂ / year</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Active Streak
              {streak > 0 && <Flame size={14} color="var(--accent-orange)" fill="var(--accent-orange)" />}
            </span>
            <div>
              <span style={{ display: 'block', fontSize: '1.4rem', fontWeight: 700 }}>
                {streak} {streak === 1 ? 'day' : 'days'}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {totalCo2Saved.toLocaleString()} kg saved total
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
