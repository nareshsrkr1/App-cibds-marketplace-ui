import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../components/ui/Button/Button';
import { logger } from '../services/logger';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('AppErrorBoundary caught an error', { error, info });
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback" role="alert">
          <div className="error-fallback__card">
            <h1>Something went wrong</h1>
            <p>
              We could not display this screen. You can try again without leaving the app.
            </p>
            <Button type="button" onClick={this.handleRetry}>
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
