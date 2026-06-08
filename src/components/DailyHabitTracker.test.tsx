import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarbonProvider } from '../context/CarbonContext';
import { DailyHabitTracker } from './DailyHabitTracker';

describe('DailyHabitTracker Component', () => {
  const renderTracker = () => {
    return render(
      <CarbonProvider>
        <DailyHabitTracker />
      </CarbonProvider>
    );
  };

  it('renders dates tabs, habit categories, and the habits checklist', () => {
    renderTracker();

    expect(screen.getByText('Daily Action Log')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();

    // Check category pills exist
    expect(screen.getByRole('button', { name: 'All Actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'transport' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'energy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'diet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'consumption' })).toBeInTheDocument();

    // Check that some habits exist
    expect(screen.getByText('Commute by bike or walk')).toBeInTheDocument();
    expect(screen.getByText('Eat a fully plant-based day')).toBeInTheDocument();
  });

  it('filters habits when category pills are clicked', () => {
    renderTracker();

    // Transport button
    const transportPill = screen.getByRole('button', { name: 'transport' });
    fireEvent.click(transportPill);

    // Should render bike commute, transit commute, but not eating vegan
    expect(screen.getByText('Commute by bike or walk')).toBeInTheDocument();
    expect(screen.queryByText('Eat a fully plant-based day')).not.toBeInTheDocument();

    // Diet button
    const dietPill = screen.getByRole('button', { name: 'diet' });
    fireEvent.click(dietPill);

    expect(screen.queryByText('Commute by bike or walk')).not.toBeInTheDocument();
    expect(screen.getByText('Eat a fully plant-based day')).toBeInTheDocument();

    // All actions returns all
    const allPill = screen.getByRole('button', { name: 'All Actions' });
    fireEvent.click(allPill);
    expect(screen.getByText('Commute by bike or walk')).toBeInTheDocument();
    expect(screen.getByText('Eat a fully plant-based day')).toBeInTheDocument();
  });

  it('toggles habits completion and updates progress statistics', () => {
    renderTracker();

    // Starts at 0 habits
    expect(screen.getByText((_, el) => el?.textContent === 'Logged: 0 of 12 habits')).toBeInTheDocument();
    expect(screen.getByText('Saved today: 0.0 kg CO₂')).toBeInTheDocument();

    // Find and click "Commute by bike or walk"
    const bikeCheckbox = screen.getByRole('checkbox', { name: /Commute by bike or walk/ });
    fireEvent.click(bikeCheckbox);

    // Updates statistics to 1 logged habit and 3.5 kg saved
    expect(screen.getByText((_, el) => el?.textContent === 'Logged: 1 of 12 habits')).toBeInTheDocument();
    expect(screen.getByText('Saved today: 3.5 kg CO₂')).toBeInTheDocument();
    expect(bikeCheckbox).toHaveAttribute('aria-checked', 'true');

    // Untoggle
    fireEvent.click(bikeCheckbox);
    expect(screen.getByText((_, el) => el?.textContent === 'Logged: 0 of 12 habits')).toBeInTheDocument();
    expect(screen.getByText('Saved today: 0.0 kg CO₂')).toBeInTheDocument();
    expect(bikeCheckbox).toHaveAttribute('aria-checked', 'false');
  });

  it('allows logging habits on past dates separately', () => {
    renderTracker();

    // Toggle today's bike habit
    const bikeCheckbox = screen.getByRole('checkbox', { name: /Commute by bike or walk/ });
    fireEvent.click(bikeCheckbox);
    expect(screen.getByText('Saved today: 3.5 kg CO₂')).toBeInTheDocument();

    // Switch to Yesterday tab
    const yesterdayTab = screen.getByRole('tab', { name: 'Yesterday' });
    fireEvent.click(yesterdayTab);

    // Stats reset because yesterday starts empty
    expect(screen.getByText('Saved today: 0.0 kg CO₂')).toBeInTheDocument();

    // Toggle transit habit yesterday
    const transitCheckbox = screen.getByRole('checkbox', { name: /Take public transit/ });
    fireEvent.click(transitCheckbox);
    expect(screen.getByText('Saved today: 2.0 kg CO₂')).toBeInTheDocument();

    // Switch back to Today tab and verify bike is still completed
    const todayTab = screen.getByRole('tab', { name: 'Today' });
    fireEvent.click(todayTab);
    expect(screen.getByText('Saved today: 3.5 kg CO₂')).toBeInTheDocument();
  });

  it('handles fake/non-existent habit IDs gracefully in calculations', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = { [todayStr]: ['non-existent-habit-id', 'habit-bike'] };
    const jsonStr = JSON.stringify(data);
    const obfuscated = btoa(encodeURIComponent(jsonStr));
    localStorage.setItem('carbon_pulse_habit_history', obfuscated);

    renderTracker();

    // Since 'habit-bike' saves 3.5 and 'non-existent-habit-id' is invalid, the saved total should be 3.5 + 0 = 3.5
    expect(screen.getByText('Saved today: 3.5 kg CO₂')).toBeInTheDocument();
  });
});
