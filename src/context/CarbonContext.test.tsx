import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CarbonProvider, useCarbon } from './CarbonContext';
import { DEFAULT_ANSWERS } from '../utils/calculator';

// Simple consumer component to expose context values for testing
const TestConsumer: React.FC = () => {
  const {
    answers,
    isOnboarded,
    offsetAmount,
    habitHistory,
    updateAnswers,
    completeOnboarding,
    resetData,
    toggleHabit,
    addOffset,
    getHistoryStats
  } = useCarbon();

  const { totalCo2Saved, streak } = getHistoryStats();

  return (
    <div>
      <div data-testid="onboarded">{isOnboarded.toString()}</div>
      <div data-testid="carType">{answers.carType}</div>
      <div data-testid="offset">{offsetAmount}</div>
      <div data-testid="history">{JSON.stringify(habitHistory)}</div>
      <div data-testid="stats-co2">{totalCo2Saved}</div>
      <div data-testid="stats-streak">{streak}</div>
      
      <button data-testid="btn-update" onClick={() => updateAnswers({ carType: 'electric' })}>
        Update Car
      </button>
      <button data-testid="btn-onboard" onClick={completeOnboarding}>
        Complete Onboarding
      </button>
      <button data-testid="btn-offset" onClick={() => addOffset(50)}>
        Add Offset
      </button>
      <button data-testid="btn-offset-negative" onClick={() => addOffset(-10)}>
        Add Negative Offset
      </button>
      <button data-testid="btn-toggle-habit" onClick={() => toggleHabit('habit-bike', '2026-06-08')}>
        Toggle Bike
      </button>
      <button data-testid="btn-toggle-habit-yesterday" onClick={() => toggleHabit('habit-bike', '2026-06-07')}>
        Toggle Bike Yesterday
      </button>
      <button data-testid="btn-toggle-habit-other" onClick={() => toggleHabit('habit-led', '2026-06-08')}>
        Toggle LED
      </button>
      <button data-testid="btn-reset" onClick={resetData}>
        Reset
      </button>
    </div>
  );
};

// Error Boundary testing consumer
const ErrorConsumer: React.FC = () => {
  try {
    useCarbon();
  } catch (e: unknown) {
    return <div data-testid="error-msg">{(e as Error).message}</div>;
  }
  return <div>No Error</div>;
};

describe('CarbonContext Provider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('throws an error when useCarbon is used outside CarbonProvider', () => {
    // Suppress console.error in tests for expected errors
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ErrorConsumer />);
    expect(screen.getByTestId('error-msg').textContent).toBe('useCarbon must be used within a CarbonProvider');
    
    consoleSpy.mockRestore();
  });

  it('provides default values initially', () => {
    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    expect(screen.getByTestId('onboarded').textContent).toBe('false');
    expect(screen.getByTestId('carType').textContent).toBe('petrol');
    expect(screen.getByTestId('offset').textContent).toBe('0');
    expect(screen.getByTestId('stats-co2').textContent).toBe('0');
    expect(screen.getByTestId('stats-streak').textContent).toBe('0');
  });

  it('updates state variables and persists them in localStorage', () => {
    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    // Update car type
    act(() => {
      screen.getByTestId('btn-update').click();
    });
    expect(screen.getByTestId('carType').textContent).toBe('electric');

    // Onboard user
    act(() => {
      screen.getByTestId('btn-onboard').click();
    });
    expect(screen.getByTestId('onboarded').textContent).toBe('true');

    // Purchase Offset
    act(() => {
      screen.getByTestId('btn-offset').click();
    });
    expect(screen.getByTestId('offset').textContent).toBe('50');

    // Test localStorage is updated with obfuscated data
    const answersRaw = localStorage.getItem('carbon_pulse_answers');
    expect(answersRaw).not.toBeNull();
    const deobfuscated = JSON.parse(decodeURIComponent(atob(answersRaw!)));
    expect(deobfuscated.carType).toBe('electric');
  });

  it('ignores negative offsets', () => {
    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    act(() => {
      screen.getByTestId('btn-offset-negative').click();
    });
    expect(screen.getByTestId('offset').textContent).toBe('0');
  });

  it('toggles habits correctly on specific dates', () => {
    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    // Toggle Bike on 2026-06-08
    act(() => {
      screen.getByTestId('btn-toggle-habit').click();
    });
    expect(screen.getByTestId('history').textContent).toContain('habit-bike');
    // Co2 saved should match habit-bike co2Saved (3.5 kg) rounded to 4
    expect(screen.getByTestId('stats-co2').textContent).toBe('4');

    // Toggle Bike off again (removes the date entry when empty)
    act(() => {
      screen.getByTestId('btn-toggle-habit').click();
    });
    expect(screen.getByTestId('history').textContent).toBe('{}');
    expect(screen.getByTestId('stats-co2').textContent).toBe('0');
  });

  it('calculates streaks correctly', () => {
    // Mock Date.now() or new Date() if we want, but since toggle buttons write to static dates:
    // We can simulate today is 2026-06-08
    vi.useFakeTimers();
    // Set system time to June 8, 2026
    vi.setSystemTime(new Date('2026-06-08T12:00:00.000Z'));

    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    // Toggle habit today (2026-06-08)
    act(() => {
      screen.getByTestId('btn-toggle-habit').click();
    });
    expect(screen.getByTestId('stats-streak').textContent).toBe('1');

    // Toggle habit yesterday (2026-06-07)
    act(() => {
      screen.getByTestId('btn-toggle-habit-yesterday').click();
    });
    expect(screen.getByTestId('stats-streak').textContent).toBe('2');

    // Untoggle habit today. The streak should still be 1 (because yesterday has completions, but today does not yet).
    act(() => {
      screen.getByTestId('btn-toggle-habit').click();
    });
    expect(screen.getByTestId('stats-streak').textContent).toBe('1');

    vi.useRealTimers();
  });

  it('resets all data correctly', () => {
    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    act(() => {
      screen.getByTestId('btn-update').click();
      screen.getByTestId('btn-onboard').click();
      screen.getByTestId('btn-offset').click();
      screen.getByTestId('btn-toggle-habit').click();
    });

    expect(screen.getByTestId('carType').textContent).toBe('electric');
    expect(screen.getByTestId('onboarded').textContent).toBe('true');
    expect(screen.getByTestId('offset').textContent).toBe('50');

    act(() => {
      screen.getByTestId('btn-reset').click();
    });

    expect(screen.getByTestId('carType').textContent).toBe('petrol');
    expect(screen.getByTestId('onboarded').textContent).toBe('false');
    expect(screen.getByTestId('offset').textContent).toBe('0');
    expect(screen.getByTestId('history').textContent).toBe('{}');
  });

  it('restores state from localStorage if present', () => {
    const customAnswers = { ...DEFAULT_ANSWERS, carType: 'diesel' as const };
    localStorage.setItem('carbon_pulse_answers', btoa(encodeURIComponent(JSON.stringify(customAnswers))));
    localStorage.setItem('carbon_pulse_is_onboarded', btoa(encodeURIComponent(JSON.stringify(true))));
    localStorage.setItem('carbon_pulse_offset_amount', btoa(encodeURIComponent(JSON.stringify(120))));
    localStorage.setItem('carbon_pulse_habit_history', btoa(encodeURIComponent(JSON.stringify({ '2026-06-08': ['habit-bike'] }))));

    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    expect(screen.getByTestId('carType').textContent).toBe('diesel');
    expect(screen.getByTestId('onboarded').textContent).toBe('true');
    expect(screen.getByTestId('offset').textContent).toBe('120');
    expect(screen.getByTestId('stats-co2').textContent).toBe('4'); // 3.5 rounded is 4
  });

  it('handles corrupted localStorage data gracefully by using defaults', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('carbon_pulse_answers', 'corrupted_base64_data');

    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    // Should fall back to default answer (petrol)
    expect(screen.getByTestId('carType').textContent).toBe('petrol');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('handles localStorage quota exceeded or write errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    // Trigger state change which tries to call safeSetItem
    act(() => {
      screen.getByTestId('btn-update').click();
    });

    expect(screen.getByTestId('carType').textContent).toBe('electric'); // Component state still updates
    expect(consoleSpy).toHaveBeenCalledWith('Local storage set error:', expect.any(Error));

    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it('calculates complex streaks where today is empty and previous multiple days are completed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-08T12:00:00.000Z')); // Today is 2026-06-08

    // Seed habit history: today (06-08) is empty, yesterday (06-07) and day before yesterday (06-06) have habits
    localStorage.setItem(
      'carbon_pulse_habit_history',
      btoa(encodeURIComponent(JSON.stringify({
        '2026-06-07': ['habit-bike'],
        '2026-06-06': ['habit-bike']
      })))
    );

    render(
      <CarbonProvider>
        <TestConsumer />
      </CarbonProvider>
    );

    // Streak should be 2 because 06-07 and 06-06 are completed, and today (06-08) is not yet completed
    expect(screen.getByTestId('stats-streak').textContent).toBe('2');

    vi.useRealTimers();
  });
});
