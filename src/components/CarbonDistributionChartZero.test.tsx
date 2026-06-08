import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CarbonDistributionChart } from './CarbonDistributionChart';
import type { CalculatorAnswers } from '../utils/calculator';

vi.mock('../utils/calculator', () => ({
  calculateTransportEmissions: () => 0,
  calculateEnergyEmissions: () => 0,
  calculateDietEmissions: () => 0,
  calculateConsumptionEmissions: () => 0,
  calculateTotalEmissions: () => 0
}));

describe('CarbonDistributionChart Zero State', () => {
  it('renders zero state message when emissions are 0', () => {
    render(<CarbonDistributionChart answers={{} as CalculatorAnswers} />);
    expect(screen.getByText('No emission data logged. Complete the quiz to view.')).toBeInTheDocument();
  });
});
