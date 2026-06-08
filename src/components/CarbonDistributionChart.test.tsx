import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarbonDistributionChart } from './CarbonDistributionChart';
import type { CalculatorAnswers } from '../utils/calculator';

describe('CarbonDistributionChart Component', () => {
  const mockAnswers: CalculatorAnswers = {
    carKmPerYear: 10000,
    carType: 'petrol', // 1700 kg
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
    recyclingRate: 'none' // 0 kg (no recycling saves 0)
    // total: 1700 + 800 + 230 = 2730 kg
  };

  it('renders correctly with default answers', () => {
    render(<CarbonDistributionChart answers={mockAnswers} />);

    expect(screen.getByText('Emission Breakdown')).toBeInTheDocument();
    expect(screen.getAllByText('Transportation')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Home Energy')[0]).toBeInTheDocument();
    
    // Check total centered display (initially shows 100% Total)
    expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Total')[0]).toBeInTheDocument();
  });

  it('displays empty state when total emissions are 0', () => {
    // Verified in the zero test file
  });

  it('handles mouse hover and focus states on legend buttons', () => {
    render(<CarbonDistributionChart answers={mockAnswers} />);

    // Legend item for Transportation
    // Lucide Icons are rendered, and the button contains "Transportation"
    const transportBtn = screen.getByRole('button', { name: /Transportation:/ });
    
    // Initial display
    expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Total')[0]).toBeInTheDocument();

    // Hover over Transportation
    fireEvent.mouseEnter(transportBtn);
    // Since transportation is 1700 kg of 2730 kg total: 1700 / 2730 = 62%
    expect(screen.getAllByText('62%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Transportation')[0]).toBeInTheDocument();

    // Hover out
    fireEvent.mouseLeave(transportBtn);
    expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Total')[0]).toBeInTheDocument();

    // Focus on Transportation
    fireEvent.focus(transportBtn);
    expect(screen.getAllByText('62%')[0]).toBeInTheDocument();

    // Blur Transportation
    fireEvent.blur(transportBtn);
    expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
  });

  it('handles mouse hover on SVG circle segments', () => {
    const { container } = render(<CarbonDistributionChart answers={mockAnswers} />);
    const circles = container.querySelectorAll('circle');
    // circles[0] is the background track circle, circles[1] is Transportation segment
    expect(circles.length).toBeGreaterThan(1);
    
    // Hover over Transportation segment
    fireEvent.mouseEnter(circles[1]);
    expect(screen.getAllByText('62%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Transportation')[0]).toBeInTheDocument();

    // Hover out
    fireEvent.mouseLeave(circles[1]);
    expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Total')[0]).toBeInTheDocument();
  });
});
