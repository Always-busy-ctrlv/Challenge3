import { useState } from 'react';
import { calculateTransportEmissions, calculateEnergyEmissions, calculateDietEmissions, calculateConsumptionEmissions, type CalculatorAnswers } from '../utils/calculator';

interface ChartProps {
  answers: CalculatorAnswers;
}

export const CarbonDistributionChart: React.FC<ChartProps> = ({ answers }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const transport = calculateTransportEmissions(answers);
  const energy = calculateEnergyEmissions(answers);
  const diet = calculateDietEmissions(answers);
  const consumption = calculateConsumptionEmissions(answers);
  const total = transport + energy + diet + consumption;

  const categories = [
    { name: 'Transportation', value: transport, color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    { name: 'Home Energy', value: energy, color: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)' },
    { name: 'Diet & Waste', value: diet, color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
    { name: 'Shopping & Waste', value: consumption, color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' }
  ];

  // Circle dimensions
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91
  const strokeWidth = 8;
  const strokeWidthHover = 11;
  const center = 50;

  let accumulatedPercentage = 0;

  return (
    <div className="glass-panel flex-col gap-20 p-24 flex-1">
      <h3 className="text-2xl mb-4">Emission Breakdown</h3>
      <p className="color-secondary text-md" style={{ marginTop: '-12px' }}>
        Your carbon footprint divided by source categories.
      </p>

      {/* Accessible text fallback for screen readers */}
      <div className="sr-only">
        <h4>Emissions Data Table</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Emissions (kg CO₂)</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.value.toLocaleString()} kg</td>
                <td>{total > 0 ? Math.round((c.value / total) * 100) : 0}%</td>
              </tr>
            ))}
            <tr>
              <td>Total</td>
              <td>{total.toLocaleString()} kg</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {total === 0 ? (
        <div className="chart-zero-state color-secondary text-base" style={{ height: '220px' }}>
          No emission data logged. Complete the quiz to view.
        </div>
      ) : (
        <div className="flex-center flex-wrap gap-32">
          {/* SVG Donut */}
          <div className="relative" style={{ width: '180px', height: '180px' }}>
            <svg 
              viewBox="0 0 100 100" 
              width="100%" 
              height="100%"
              aria-hidden="true"
            >
              {/* Background empty circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={strokeWidth}
              />
              {categories.map((cat, index) => {
                if (cat.value === 0) return null;
                const percentage = cat.value / total;
                const strokeLength = percentage * circumference;
                const strokeOffset = circumference - (accumulatedPercentage * circumference) + (circumference / 4);
                
                accumulatedPercentage += percentage;
                
                const isCurrentHovered = hoveredIndex === index || focusedIndex === index;

                return (
                  <circle
                    key={cat.name}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth={isCurrentHovered ? strokeWidthHover : strokeWidth}
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    style={{
                      transformOrigin: '50% 50%',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      filter: isCurrentHovered ? `drop-shadow(0 0 4px ${cat.glow})` : 'none'
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>
            
            {/* Center Text inside Donut */}
            <div className="ring-overlay" style={{ pointerEvents: 'none' }}>
              <span className="ring-percent text-5xl">{hoveredIndex !== null ? Math.round((categories[hoveredIndex].value / total) * 100) : 100}%</span>
              <span className="ring-label tracking-wide">
                {hoveredIndex !== null ? categories[hoveredIndex].name : 'Total'}
              </span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex-col gap-12 flex-1" style={{ minWidth: '180px' }}>
            {categories.map((cat, index) => {
              const pct = total > 0 ? Math.round((cat.value / total) * 100) : 0;
              const isSelected = hoveredIndex === index || focusedIndex === index;

              return (
                <button
                  key={cat.name}
                  className="chart-legend-btn flex-between w-full"
                  style={{
                    background: isSelected ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                    borderColor: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'transparent'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  aria-label={`${cat.name}: ${cat.value.toLocaleString()} kg CO2, ${pct} percent`}
                >
                  <div className="flex-row items-center gap-10">
                    <div className="chart-legend-dot" style={{ background: cat.color }} />
                    <span className="text-md" style={{ fontWeight: isSelected ? 600 : 400 }}>{cat.name}</span>
                  </div>
                  <div className="flex-col items-end">
                    <span className="text-md font-semibold">{pct}%</span>
                    <span className="text-sm color-muted">{cat.value.toLocaleString()} kg</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
