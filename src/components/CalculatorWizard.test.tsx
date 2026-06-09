import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarbonProvider } from '../context/CarbonContext';
import { useCarbon } from '../context/useCarbon';
import { CalculatorWizard } from './CalculatorWizard';

// Helper wrapper to output context values for assertion
const OnboardingStatusDisplay: React.FC = () => {
  const { isOnboarded, answers } = useCarbon();
  return (
    <div>
      <div data-testid="onboarded-status">{isOnboarded.toString()}</div>
      <div data-testid="car-km-val">{answers.carKmPerYear}</div>
      <div data-testid="flights-short-val">{answers.flightsShortPerYear}</div>
      <div data-testid="flights-long-val">{answers.flightsLongPerYear}</div>
    </div>
  );
};

describe('CalculatorWizard Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderWizard = () => {
    return render(
      <CarbonProvider>
        <CalculatorWizard />
        <OnboardingStatusDisplay />
      </CarbonProvider>
    );
  };

  it('renders Step 1 (Transportation) and allows input updates', () => {
    renderWizard();

    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getAllByText('Transportation')[0]).toBeInTheDocument();

    // Verify Car Fuel Type dropdown exists
    const carTypeSelect = screen.getByLabelText('Primary Car Fuel Type') as HTMLSelectElement;
    expect(carTypeSelect).toBeInTheDocument();
    expect(carTypeSelect.value).toBe('petrol'); // Default

    // Verify Driving Distance slider exists since default is petrol
    const carKmInput = screen.getByLabelText(/Annual Driving Distance/) as HTMLInputElement;
    expect(carKmInput).toBeInTheDocument();

    // Change Car Fuel Type to "No Car" and verify distance slider disappears
    fireEvent.change(carTypeSelect, { target: { value: 'none' } });
    expect(screen.queryByLabelText(/Annual Driving Distance/)).not.toBeInTheDocument();

    // Re-select Petrol and verify slider returns
    fireEvent.change(carTypeSelect, { target: { value: 'petrol' } });
    const carKmInputReturn = screen.getByLabelText(/Annual Driving Distance/) as HTMLInputElement;
    expect(carKmInputReturn).toBeInTheDocument();

    // Adjust Driving Distance slider
    fireEvent.change(carKmInputReturn, { target: { value: '12000' } });
    expect(screen.getByTestId('car-km-val').textContent).toBe('12000');

    // Test flight number updates
    const shortFlightsInput = screen.getByLabelText(/Short Flights/) as HTMLInputElement;
    fireEvent.change(shortFlightsInput, { target: { value: '5' } });
    expect(screen.getByTestId('flights-short-val').textContent).toBe('5');

    const longFlightsInput = screen.getByLabelText(/Long Flights/) as HTMLInputElement;
    fireEvent.change(longFlightsInput, { target: { value: '3' } });
    expect(screen.getByTestId('flights-long-val').textContent).toBe('3');

    // Test negative/empty input sanitization
    fireEvent.change(shortFlightsInput, { target: { value: '-2' } });
    expect(screen.getByTestId('flights-short-val').textContent).toBe('0'); // Clamped to 0

    fireEvent.change(shortFlightsInput, { target: { value: '' } });
    expect(screen.getByTestId('flights-short-val').textContent).toBe('0'); // Empty string treated as 0

    // Test transit hours range slider
    const transitSlider = screen.getByLabelText(/Public Transit Usage/) as HTMLInputElement;
    fireEvent.change(transitSlider, { target: { value: '15' } });
  });

  it('can navigate steps forward and backward', () => {
    renderWizard();

    // Initially Back is disabled
    const backBtn = screen.getByRole('button', { name: /Previous step/ });
    expect(backBtn).toBeDisabled();

    // Click Next to go to Step 2: Home Energy
    const nextBtn = screen.getByRole('button', { name: /Next step/ });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getAllByText('Home Energy')[0]).toBeInTheDocument();
    expect(backBtn).not.toBeDisabled();

    // Test Step 2 Input (electricity usage range slider)
    const electricSlider = screen.getByLabelText(/Monthly Electricity Consumption/) as HTMLInputElement;
    fireEvent.change(electricSlider, { target: { value: '450' } });

    // Test Clean energy range slider
    const cleanSlider = screen.getByLabelText(/Clean\/Renewable Energy Share/) as HTMLInputElement;
    fireEvent.change(cleanSlider, { target: { value: '80' } });

    // Select natural gas heating and change consumption
    const heatSelect = screen.getByLabelText('Primary Heating Fuel') as HTMLSelectElement;
    fireEvent.change(heatSelect, { target: { value: 'gas' } });
    const heatSlider = screen.getByLabelText(/Monthly Heating Consumption/) as HTMLInputElement;
    fireEvent.change(heatSlider, { target: { value: '300' } });

    // Go Back to Step 1 and check if values are retained
    fireEvent.click(backBtn);
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByTestId('car-km-val').textContent).toBe('8000'); // Standard default since state refreshed

    // Go forward again
    fireEvent.click(nextBtn);
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
  });

  it('completes the entire onboarding wizard', () => {
    renderWizard();

    const nextBtn = () => screen.getByRole('button', { name: /Next step/ });
    const submitBtn = () => screen.getByRole('button', { name: /Calculate Carbon Footprint/ });

    // Step 1 -> Step 2
    fireEvent.click(nextBtn());
    expect(screen.getAllByText('Home Energy')[0]).toBeInTheDocument();

    // Step 2 -> Step 3
    fireEvent.click(nextBtn());
    expect(screen.getAllByText('Diet & Waste')[0]).toBeInTheDocument();

    // Test Step 3 dropdowns
    const dietSelect = screen.getByLabelText('Diet Profile') as HTMLSelectElement;
    fireEvent.change(dietSelect, { target: { value: 'vegan' } });

    const wasteSelect = screen.getByLabelText('Household Food Waste Level') as HTMLSelectElement;
    fireEvent.change(wasteSelect, { target: { value: 'low' } });

    // Step 3 -> Step 4
    fireEvent.click(nextBtn());
    expect(screen.getAllByText('Shopping & Waste')[0]).toBeInTheDocument();

    // Test Step 4 dropdowns
    const clothesSelect = screen.getByLabelText('Clothing Purchase Habits') as HTMLSelectElement;
    fireEvent.change(clothesSelect, { target: { value: 'light' } });

    const electronicsSelect = screen.getByLabelText('Electronics & Gadgets Habits') as HTMLSelectElement;
    fireEvent.change(electronicsSelect, { target: { value: 'light' } });

    const recycleSelect = screen.getByLabelText('Recycling & Composting Rate') as HTMLSelectElement;
    fireEvent.change(recycleSelect, { target: { value: 'all' } });

    // Verify Onboarding Status is false before final click
    expect(screen.getByTestId('onboarded-status').textContent).toBe('false');

    // Click Calculate Footprint to complete
    fireEvent.click(submitBtn());
    expect(screen.getByTestId('onboarded-status').textContent).toBe('true');
  });
});
