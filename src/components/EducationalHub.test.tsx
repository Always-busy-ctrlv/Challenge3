import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CarbonProvider } from '../context/CarbonContext';
import { useCarbon } from '../context/useCarbon';
import { EducationalHub } from './EducationalHub';

// Simple child component to view offset statistics in parent provider
const OffsetAmountDisplay: React.FC = () => {
  const { offsetAmount } = useCarbon();
  return <div data-testid="total-offset-val">{offsetAmount}</div>;
};

describe('EducationalHub Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderHub = () => {
    return render(
      <CarbonProvider>
        <EducationalHub />
        <OffsetAmountDisplay />
      </CarbonProvider>
    );
  };

  it('renders offsetting details and allows project selection changes', () => {
    renderHub();

    expect(screen.getByText('Carbon Offsetting Hub')).toBeInTheDocument();
    expect(screen.getByText('Offset Simulator')).toBeInTheDocument();

    const select = screen.getByLabelText('Choose Environmental Project') as HTMLSelectElement;
    expect(select.value).toBe('proj-trees'); // Default

    // Change to Wind Project
    fireEvent.change(select, { target: { value: 'proj-wind' } });
    expect(select.value).toBe('proj-wind');
    expect(screen.getByText(/Renewable energy infrastructure/)).toBeInTheDocument();
  });

  it('calculates the estimated cost dynamically based on project cost and input amount', () => {
    renderHub();

    const select = screen.getByLabelText('Choose Environmental Project') as HTMLSelectElement;
    const input = screen.getByLabelText('Amount to Offset (kg CO₂)') as HTMLInputElement;

    // Default amount: 250kg on proj-trees ($15/tonne) -> 0.25 * 15 = $3.75
    expect(screen.getByText(/Estimated Cost:/)).toBeInTheDocument();
    expect(screen.getByText('$3.75')).toBeInTheDocument();

    // Change input to 1000kg -> cost should be $15.00
    fireEvent.change(input, { target: { value: '1000' } });
    expect(screen.getByText('$15.00')).toBeInTheDocument();

    // Switch project to Wind ($8/tonne) -> 1000kg should cost $8.00
    fireEvent.change(select, { target: { value: 'proj-wind' } });
    expect(screen.getByText('$8.00')).toBeInTheDocument();

    // Test preset buttons
    const presetBtn100 = screen.getByRole('button', { name: '+100 kg' });
    const presetBtn500 = screen.getByRole('button', { name: '+500 kg' });
    const presetBtn1000 = screen.getByRole('button', { name: '+1,000 kg' });

    fireEvent.click(presetBtn100);
    expect(input.value).toBe('100');

    fireEvent.click(presetBtn500);
    expect(input.value).toBe('500');
    expect(screen.getByText('$4.00')).toBeInTheDocument();

    fireEvent.click(presetBtn1000);
    expect(input.value).toBe('1000');
  });

  it('clamps invalid or negative inputs to 0 cost and disables submit button', () => {
    renderHub();

    const input = screen.getByLabelText('Amount to Offset (kg CO₂)') as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: 'Simulate Purchase' });

    // Set to negative
    fireEvent.change(input, { target: { value: '-200' } });
    expect(screen.queryByText(/Estimated Cost:/)).not.toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    // Set to invalid string
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(screen.queryByText(/Estimated Cost:/)).not.toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });

  it('submits offset and updates context amount with success popup', () => {
    vi.useFakeTimers();
    renderHub();

    const input = screen.getByLabelText('Amount to Offset (kg CO₂)') as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: 'Simulate Purchase' });

    // Set to 500 kg
    fireEvent.change(input, { target: { value: '500' } });
    
    expect(screen.getByTestId('total-offset-val').textContent).toBe('0');

    // Click submit
    fireEvent.click(submitBtn);

    // Verify context updated
    expect(screen.getByTestId('total-offset-val').textContent).toBe('500');

    // Verify success message rendered
    expect(screen.getByRole('alert')).toHaveTextContent(/Successfully logged 500 kg carbon offset/);

    // Advance timers by 3 seconds to check success notification clears
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('does not log offset if form is submitted with non-positive amount', () => {
    renderHub();
    const form = screen.getByRole('button', { name: 'Simulate Purchase' }).closest('form')!;
    const input = screen.getByLabelText('Amount to Offset (kg CO₂)') as HTMLInputElement;

    // Set input to negative which makes sanitizedAmount = 0
    fireEvent.change(input, { target: { value: '-10' } });
    
    // Programmatically submit the form
    fireEvent.submit(form);

    // Context amount should still be 0, and no success alert
    expect(screen.getByTestId('total-offset-val').textContent).toBe('0');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
