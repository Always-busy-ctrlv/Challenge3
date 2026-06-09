import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// A component that always throws an error for testing boundaries
const ProblematicComponent: React.FC = () => {
  throw new Error('Test rendering crash');
};

describe('ErrorBoundary Component', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Normal Flow</div>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('child').textContent).toBe('Normal Flow');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('catches crashes and displays warning UI with try-again button', () => {
    // Suppress console.error since error throwing is deliberate and expected
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    // Verify fallback UI is rendered
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error: Test rendering crash')).toBeInTheDocument();

    // Verify the try-again button exists
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
