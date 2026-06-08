import React from 'react';
import { CarbonProvider, useCarbon } from './context/CarbonContext';
import { CalculatorWizard } from './components/CalculatorWizard';
import { DashboardOverview } from './components/DashboardOverview';
import { CarbonDistributionChart } from './components/CarbonDistributionChart';
import { DailyHabitTracker } from './components/DailyHabitTracker';
import { PersonalizedInsights } from './components/PersonalizedInsights';
import { EducationalHub } from './components/EducationalHub';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Leaf } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isOnboarded, answers } = useCarbon();

  if (!isOnboarded) {
    return (
      <div 
        className="container animate-fade-in" 
        style={{ 
          padding: '40px 16px', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center' 
        }}
      >
        <header style={{ textAlign: 'center', marginBottom: '20px' }} role="banner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px' }}>
            <Leaf size={32} aria-hidden="true" />
            <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff' }}>CarbonPulse</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            A carbon footprint tracking and habit reduction engine
          </p>
        </header>
        
        <CalculatorWizard />
      </div>
    );
  }

  return (
    <div 
      className="container animate-fade-in" 
      style={{ 
        padding: '24px 16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '32px' 
      }}
    >
      {/* Top Brand Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }} role="banner">
        <Leaf size={28} aria-hidden="true" />
        <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>CarbonPulse</h1>
      </header>

      {/* Main dashboard grid container */}
      <main 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px' 
        }}
        role="main"
      >
        <DashboardOverview />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <CarbonDistributionChart answers={answers} />
          <PersonalizedInsights />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <DailyHabitTracker />
          <EducationalHub />
        </div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <CarbonProvider>
        <AppContent />
      </CarbonProvider>
    </ErrorBoundary>
  );
};

export default App;
