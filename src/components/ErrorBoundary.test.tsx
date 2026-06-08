import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// A component that always throws an error for testing boundaries
const ProblematicComponent: React.FC = () => {
  throw new Error('Test rendering crash');
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.stubGlobal('location', {
      reload: vi.fn()
    });
    localStorage.clear();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Normal Flow</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child').textContent).toBe('Normal Flow');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('catches crashes, displays warning UI, and runs reset handler on click', () => {
    // Suppress console.error inside the test block since error throwing is deliberate and expected here
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('test_key', 'test_val');

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    // Verify fallback UI is rendered
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error: Test rendering crash')).toBeInTheDocument();

    // Click Reset & Reload Button
    const resetBtn = screen.getByRole('button', { name: 'Reset App Data & Reload' });
    fireEvent.click(resetBtn);

    // Verify localStorage was cleared and reload was triggered
    expect(localStorage.getItem('test_key')).toBeNull();
    expect(window.location.reload).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
