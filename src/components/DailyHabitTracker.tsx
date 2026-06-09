import React, { useState } from 'react';
import { useCarbon } from '../context/useCarbon';
import { DAILY_HABITS } from '../context/carbonHelpers';
import { CheckCircle } from 'lucide-react';

export const DailyHabitTracker: React.FC = () => {
  const { habitHistory, toggleHabit } = useCarbon();
  const [activeCategory, setActiveCategory] = useState<'all' | 'transport' | 'energy' | 'diet' | 'consumption'>('all');
  
  // Date selection helper
  const getLocalDateString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  const datesList = [
    { label: 'Today', value: getLocalDateString(0) },
    { label: 'Yesterday', value: getLocalDateString(1) },
    { label: '2 Days Ago', value: getLocalDateString(2) }
  ];

  const [activeDateStr, setActiveDateStr] = useState<string>(datesList[0].value);

  // Active completed habits for the selected date
  const completedHabitIds = habitHistory[activeDateStr] || [];

  // Filter habits
  const filteredHabits = DAILY_HABITS.filter(habit => 
    activeCategory === 'all' || habit.category === activeCategory
  );

  // Stats for the active date
  const totalCo2SavedToday = completedHabitIds.reduce((sum, id) => {
    const habit = DAILY_HABITS.find(h => h.id === id);
    return sum + (habit ? habit.co2Saved : 0);
  }, 0);

  const completionPercent = DAILY_HABITS.length > 0 
    ? Math.round((completedHabitIds.length / DAILY_HABITS.length) * 100)
    : 0;

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Daily Action Log</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Log simple habits to reduce your emissions in real-time.
          </p>
        </div>

        {/* Date Tabs */}
        <div 
          role="tablist" 
          aria-label="Select Log Date" 
          style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid var(--card-border)' }}
        >
          {datesList.map(date => {
            const isActive = activeDateStr === date.value;
            return (
              <button
                key={date.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveDateStr(date.value)}
                style={{
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#060913' : 'var(--text-primary)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'var(--transition-fast)'
                }}
              >
                {date.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Summary Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Logged: <strong>{completedHabitIds.length}</strong> of <strong>{DAILY_HABITS.length}</strong> habits
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>
            Saved today: {totalCo2SavedToday.toFixed(1)} kg CO₂
          </span>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${completionPercent}%`,
            background: 'var(--primary)',
            boxShadow: '0 0 8px var(--primary-glow)',
            transition: 'var(--transition-smooth)'
          }} />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} role="group" aria-label="Filter habits by category">
        {(['all', 'transport', 'energy', 'diet', 'consumption'] as const).map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'var(--card-border)',
                padding: '6px 12px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'capitalize',
                transition: 'var(--transition-fast)'
              }}
            >
              {cat === 'all' ? 'All Actions' : cat}
            </button>
          );
        })}
      </div>

      {/* Habits Checklist Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
        {filteredHabits.map(habit => {
          const isCompleted = completedHabitIds.includes(habit.id);
          
          return (
            <button
              key={habit.id}
              role="checkbox"
              aria-checked={isCompleted}
              aria-label={`${habit.name}: ${habit.description}, saves ${habit.co2Saved} kg of CO2`}
              onClick={() => toggleHabit(habit.id, activeDateStr)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: isCompleted ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                border: '1px solid',
                borderColor: isCompleted ? 'rgba(16, 185, 129, 0.25)' : 'var(--card-border)',
                textAlign: 'left',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                outline: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{
                  color: isCompleted ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'var(--transition-fast)'
                }}>
                  <CheckCircle 
                    size={22} 
                    fill={isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'transparent'} 
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <span style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    color: isCompleted ? '#ffffff' : 'var(--text-primary)',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    opacity: isCompleted ? 0.85 : 1
                  }}>
                    {habit.name}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {habit.description}
                  </span>
                </div>
              </div>
              
              <div style={{
                background: isCompleted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                color: isCompleted ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                -{habit.co2Saved.toFixed(1)} kg
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
