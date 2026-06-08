import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

describe('CarbonPulse App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders onboarding initially, then transitions to full dashboard upon wizard completion', () => {
    render(<App />);

    // Initially, onboarding header is displayed
    expect(screen.getByText('A carbon footprint tracking and habit reduction engine')).toBeInTheDocument();
    expect(screen.getAllByText('Transportation')[0]).toBeInTheDocument();

    // Verify Dashboard modules are NOT visible initially
    expect(screen.queryByText('Daily Action Log')).not.toBeInTheDocument();
    expect(screen.queryByText('Carbon Offsetting Hub')).not.toBeInTheDocument();

    // Complete the onboarding steps
    const nextBtn = () => screen.getByRole('button', { name: /Next step/ });

    // Step 1 -> Step 2
    fireEvent.click(nextBtn());
    expect(screen.getAllByText('Home Energy')[0]).toBeInTheDocument();

    // Step 2 -> Step 3
    fireEvent.click(nextBtn());
    expect(screen.getAllByText('Diet & Waste')[0]).toBeInTheDocument();

    // Step 3 -> Step 4
    fireEvent.click(nextBtn());
    expect(screen.getAllByText('Shopping & Waste')[0]).toBeInTheDocument();

    // Complete
    const submitBtn = screen.getByRole('button', { name: /Calculate Carbon Footprint/ });
    fireEvent.click(submitBtn);

    // Onboarding header should clear
    expect(screen.queryByText('A carbon footprint tracking and habit reduction engine')).not.toBeInTheDocument();

    // Dashboard elements should now be visible in DOM
    expect(screen.getByText('CarbonPulse Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Emission Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Personalized Action Plan')).toBeInTheDocument();
    expect(screen.getByText('Daily Action Log')).toBeInTheDocument();
    expect(screen.getByText('Carbon Offsetting Hub')).toBeInTheDocument();
  });
});
