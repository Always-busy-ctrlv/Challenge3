import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { CarbonProvider } from '../context/CarbonContext';
import { useCarbon } from '../context/useCarbon';
import { PersonalizedInsights } from './PersonalizedInsights';

const OptimizeAnswersConsumer: React.FC = () => {
  const { updateAnswers } = useCarbon();
  
  // Set answers to fully optimized values to trigger congratulations state
  const handleClick = () => {
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
      dietType: 'vegan',
      foodWaste: 'low',
      clothingPurchase: 'light',
      electronicsPurchase: 'light',
      recyclingRate: 'all'
    });
  };

  return (
    <button data-testid="btn-optimize" onClick={handleClick}>
      Optimize Answers
    </button>
  );
};

describe('PersonalizedInsights Component', () => {
  const renderInsights = () => {
    return render(
      <CarbonProvider>
        <PersonalizedInsights />
        <OptimizeAnswersConsumer />
      </CarbonProvider>
    );
  };

  it('renders a list of insight cards based on emission categories', () => {
    renderInsights();

    expect(screen.getByText('Personalized Action Plan')).toBeInTheDocument();
    
    // Default answers (petrol car, gas heating, balanced diet) should trigger recommendations
    expect(screen.getByText('Consider transitioning to an electric or hybrid vehicle')).toBeInTheDocument();
    expect(screen.getByText('Switch to a 100% clean energy provider')).toBeInTheDocument();
    expect(screen.getByText('Incorporate more plant-based meals')).toBeInTheDocument();

    // Check action type tags (DOM text is case-sensitive, CSS makes it uppercase visually)
    expect(screen.getByText('Vehicle Upgrade')).toBeInTheDocument();
    expect(screen.getByText('Green Energy Switch')).toBeInTheDocument();
  });

  it('shows congratulations state when profile is fully optimized', () => {
    renderInsights();

    // Verify recommendations exist initially
    expect(screen.getByText('Consider transitioning to an electric or hybrid vehicle')).toBeInTheDocument();

    // Click to optimize answers inside act
    act(() => {
      fireEvent.click(screen.getByTestId('btn-optimize'));
    });

    // Recommendations should disappear, and congratulations display should show
    expect(screen.queryByText('Consider transitioning to an electric or hybrid vehicle')).not.toBeInTheDocument();
    expect(screen.getByText('Your Profile is Fully Optimized!')).toBeInTheDocument();
    expect(screen.getByText(/You have achieved maximum efficiency across transportation/)).toBeInTheDocument();
  });
});
