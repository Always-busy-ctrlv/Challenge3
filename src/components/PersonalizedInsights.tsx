import React from 'react';
import { useCarbon } from '../context/CarbonContext';
import { generateInsights } from '../utils/insights';
import { Lightbulb, CheckCircle2, TrendingDown } from 'lucide-react';

export const PersonalizedInsights: React.FC = () => {
  const { answers } = useCarbon();
  const insights = generateInsights(answers);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Personalized Action Plan</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '-4px' }}>
          Targeted suggestions prioritized by potential emission reductions.
        </p>
      </div>

      {insights.length === 0 ? (
        <div style={{
          background: 'rgba(16, 185, 129, 0.03)',
          border: '1px dashed rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={40} color="var(--primary)" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Your Profile is Fully Optimized!</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
            Excellent work. You have achieved maximum efficiency across transportation, energy, diet, and consumption categories.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
          {insights.map((insight) => (
            <div
              key={insight.id}
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: 'var(--accent-orange)',
                  padding: '8px',
                  borderRadius: '8px'
                }}>
                  <Lightbulb size={20} aria-hidden="true" />
                </div>
                <div>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}>
                    {insight.actionType}
                  </span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px', color: '#ffffff' }}>
                    {insight.title}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                    {insight.description}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '6px',
                textAlign: 'right'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                  <TrendingDown size={14} />
                  <span>-{insight.potentialSaving.toLocaleString()} kg</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CO₂ saved / yr</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
