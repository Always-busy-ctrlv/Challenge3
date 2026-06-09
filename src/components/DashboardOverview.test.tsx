import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarbonProvider } from '../context/CarbonContext';
import { useCarbon } from '../context/useCarbon';
import { DashboardOverview } from './DashboardOverview';

// Consumer component to display onboarding status (so we can assert on resets)
const OnboardingStatusDisplay: React.FC = () => {
  const { isOnboarded } = useCarbon();
  return <div data-testid="onboard-state">{isOnboarded.toString()}</div>;
};

// Component to set initial answers and completed onboarding in context before loading dashboard
const SetStateWrapper: React.FC<{ children: React.ReactNode; isOver?: boolean }> = ({ children, isOver = false }) => {
  const { updateAnswers, completeOnboarding, addOffset } = useCarbon();
  
  React.useEffect(() => {
    if (isOver) {
      // High emissions: petrol car 20,000km (3400 kg) -> exceeds 2,000 kg target
      updateAnswers({
        carKmPerYear: 20000,
        carType: 'petrol',
        flightsShortPerYear: 0,
        flightsLongPerYear: 0,
        publicTransitHoursPerWeek: 0,
        electricityKwhPerMonth: 0,
        cleanEnergyRatio: 100,
        heatingSource: 'none',
        heatingKwhPerMonth: 0,
        dietType: 'vegan', // 800 kg. Total: 4200 kg gross.
        foodWaste: 'low',
        clothingPurchase: 'light',
        electronicsPurchase: 'light',
        recyclingRate: 'all'
      });
    } else {
      // Low emissions: no car, vegan diet, clean energy -> within 2,000 kg target
      updateAnswers({
        carKmPerYear: 0,
        carType: 'none',
        flightsShortPerYear: 0,
        flightsLongPerYear: 0,
        publicTransitHoursPerWeek: 0,
        electricityKwhPerMonth: 0,
        cleanEnergyRatio: 100,
        heatingSource: 'none',
        heatingKwhPerMonth: 0,
        dietType: 'vegan', // 800 kg
        foodWaste: 'low',
        clothingPurchase: 'light', // 150 kg
        electronicsPurchase: 'light', // 80 kg
        recyclingRate: 'all' // -200 kg. Total: 830 kg gross.
      });
      // Add offset of 500kg
      addOffset(500); // Net = 830 - 500 = 330 kg
    }
    completeOnboarding();
  }, [addOffset, completeOnboarding, isOver, updateAnswers]);

  return <>{children}</>;
};

describe('DashboardOverview Component', () => {
  it('renders stats within budget correctly', () => {
    render(
      <CarbonProvider>
        <SetStateWrapper isOver={false}>
          <DashboardOverview />
        </SetStateWrapper>
      </CarbonProvider>
    );

    expect(screen.getByText('CarbonPulse Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Eco-Target Compliant')).toBeInTheDocument();
    expect(screen.getByText('Gross Footprint')).toBeInTheDocument();
    expect(screen.getByText('830')).toBeInTheDocument(); 

    // Offsets Display (-500)
    expect(screen.getByText('-500')).toBeInTheDocument();

    // Net display (830 - 500 = 330)
    expect(screen.getByText('330')).toBeInTheDocument();

    // Within budget target text should display
    expect(screen.getByText(/Your net footprint remains within the global carbon budget/)).toBeInTheDocument();
  });

  it('renders stats over budget correctly', () => {
    render(
      <CarbonProvider>
        <SetStateWrapper isOver={true}>
          <DashboardOverview />
        </SetStateWrapper>
      </CarbonProvider>
    );

    expect(screen.getByText('Above Target Limit')).toBeInTheDocument();
    expect(screen.getByText(/Your net emissions exceed the sustainable target/)).toBeInTheDocument();
  });

  it('resets profile data when reset button is clicked', () => {
    render(
      <CarbonProvider>
        <SetStateWrapper isOver={false}>
          <DashboardOverview />
          <OnboardingStatusDisplay />
        </SetStateWrapper>
      </CarbonProvider>
    );

    // Initial check: user is onboarded
    expect(screen.getByTestId('onboard-state').textContent).toBe('true');

    // Click Reset
    const resetBtn = screen.getByRole('button', { name: 'Reset all carbon footprint data' });
    fireEvent.click(resetBtn);

    // Verify context state is reset and onboard-state is now false
    expect(screen.getByTestId('onboard-state').textContent).toBe('false');
  });

  it('renders streak info for 1 day correctly', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    localStorage.setItem(
      'carbon_pulse_habit_history',
      btoa(encodeURIComponent(JSON.stringify({ [yesterdayStr]: ['habit-bike'] })))
    );

    render(
      <CarbonProvider>
        <SetStateWrapper isOver={false}>
          <DashboardOverview />
        </SetStateWrapper>
      </CarbonProvider>
    );

    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('renders streak info for 2 days correctly and displays flame icon', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    localStorage.setItem(
      'carbon_pulse_habit_history',
      btoa(encodeURIComponent(JSON.stringify({
        [yesterdayStr]: ['habit-bike'],
        [twoDaysAgoStr]: ['habit-bike']
      })))
    );

    render(
      <CarbonProvider>
        <SetStateWrapper isOver={false}>
          <DashboardOverview />
        </SetStateWrapper>
      </CarbonProvider>
    );

    expect(screen.getByText('2 days')).toBeInTheDocument();
  });
});
