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

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by CarbonPulse ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear potentially corrupted local storage items and reload page
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#060913',
            color: '#F3F4F6',
            fontFamily: "var(--font-body, 'Inter', sans-serif)"
          }}
          role="alert"
          aria-live="assertive"
        >
          <div 
            className="glass-panel" 
            style={{ 
              maxWidth: '500px', 
              width: '100%', 
              padding: '40px 32px', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{
              background: 'rgba(239, 44, 44, 0.1)',
              border: '1px solid rgba(239, 44, 44, 0.2)',
              color: '#EF4444',
              padding: '16px',
              borderRadius: '50%',
              display: 'inline-flex'
            }}>
              <ShieldAlert size={40} aria-hidden="true" />
            </div>

            <h1 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)' }}>Something went wrong</h1>
            
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', lineHeight: 1.5 }}>
              CarbonPulse encountered an unexpected rendering error. This could be due to corrupted local data state.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '12px',
              borderRadius: '8px',
              width: '100%',
              textAlign: 'left',
              fontSize: '0.75rem',
              color: '#EF4444',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {this.state.error?.toString()}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={this.handleReset}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Reset App Data & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
