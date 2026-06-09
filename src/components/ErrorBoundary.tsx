import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // React lifecycle requires this signature — parameters are intentionally unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Error is already captured in state via getDerivedStateFromError
    // Intentionally no console output in production to avoid information leakage
  }

  private handleReset = (): void => {
    // Reset error state to re-attempt rendering the component tree
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" role="alert" aria-live="assertive">
          <div className="glass-panel error-boundary-card">
            <div className="error-icon-wrapper">
              <ShieldAlert size={40} aria-hidden="true" />
            </div>

            <h1 className="text-5xl font-heading">Something went wrong</h1>
            
            <p className="color-secondary text-base leading-normal">
              CarbonPulse encountered an unexpected rendering error. This could be due to corrupted local data state.
            </p>

            <div className="error-stack-trace">
              {this.state.error?.toString()}
            </div>

            <button
              className="btn btn-primary w-full mt-10"
              onClick={this.handleReset}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
