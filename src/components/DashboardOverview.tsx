import React from 'react';
import { useCarbon } from '../context/useCarbon';
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
    <div className="flex-col gap-24">
      {/* Top Banner Row */}
      <div className="glass-panel flex-between flex-wrap gap-20 p-24 dashboard-banner">
        <div>
          <span className="dashboard-label">Live Performance</span>
          <h2 className="text-5xl mt-4">CarbonPulse Dashboard</h2>
        </div>
        
        <button 
          className="btn btn-danger btn-sm" 
          onClick={resetData}
          aria-label="Reset all carbon footprint data"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Reset Profile
        </button>
      </div>

      {/* Hero Stats Row: Ring + Category Cards */}
      <div className="grid-auto-fit-280">
        
        {/* Budget Circular Ring Visualizer */}
        <div className="glass-panel animate-glow flex-center gap-24 p-24">
          <div className="relative" style={{ width: '120px', height: '120px' }}>
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
            <div className="ring-overlay">
              <span className="ring-percent">{budgetPercent}%</span>
              <span className="ring-label">Budget</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl flex-row items-center gap-8">
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
            <p className="color-secondary text-body mt-6 leading-snug">
              {isOverBudget 
                ? `Your net emissions exceed the sustainable target of ${budgetTarget.toLocaleString()} kg/yr. Adopt daily habits to reduce.` 
                : `Awesome! Your net footprint remains within the global carbon budget target of ${budgetTarget.toLocaleString()} kg/yr.`
              }
            </p>
          </div>
        </div>

        {/* Numeric stats cards grid */}
        <div className="grid-2col">
          
          <div className="glass-panel stat-card">
            <span className="stat-label">Gross Footprint</span>
            <div>
              <span className="stat-value">{grossEmissions.toLocaleString()}</span>
              <span className="stat-unit">kg CO₂ / year</span>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <span className="stat-label">Offsets Logged</span>
            <div>
              <span className="stat-value color-primary">-{offsetAmount.toLocaleString()}</span>
              <span className="stat-unit">kg CO₂ offset</span>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <span className="stat-label">Net Emissions</span>
            <div>
              <span className="stat-value">{netEmissions.toLocaleString()}</span>
              <span className="stat-unit">kg CO₂ / year</span>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <span className="stat-label-row">
              Active Streak
              {streak > 0 && <Flame size={14} color="var(--accent-orange)" fill="var(--accent-orange)" />}
            </span>
            <div>
              <span className="stat-value">
                {streak} {streak === 1 ? 'day' : 'days'}
              </span>
              <span className="stat-unit">
                {totalCo2Saved.toLocaleString()} kg saved total
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
