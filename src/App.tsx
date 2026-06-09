import React from 'react';
import { CarbonProvider } from './context/CarbonContext';
import { useCarbon } from './context/useCarbon';
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
      <div className="container animate-fade-in app-onboarding">
        <header className="text-center mb-20" role="banner">
          <div className="app-brand app-brand-lg">
            <Leaf size={32} aria-hidden="true" />
            <span className="text-brand font-extrabold font-heading color-white">CarbonPulse</span>
          </div>
          <p className="color-secondary text-lg">
            A carbon footprint tracking and habit reduction engine
          </p>
        </header>
        
        <CalculatorWizard />
      </div>
    );
  }

  return (
    <div className="container animate-fade-in app-dashboard">
      {/* Top Brand Header */}
      <header className="app-brand" role="banner">
        <Leaf size={28} aria-hidden="true" />
        <h1 className="text-hero color-white">CarbonPulse</h1>
      </header>

      {/* Main dashboard grid container */}
      <main className="flex-col gap-24" role="main">
        <DashboardOverview />
        
        <div className="grid-auto-fit">
          <CarbonDistributionChart answers={answers} />
          <PersonalizedInsights />
        </div>

        <div className="grid-auto-fit">
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
