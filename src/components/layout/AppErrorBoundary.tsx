import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Atlas render failed', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="document-page" role="alert">
          <p className="eyebrow">Archive fault</p>
          <h1>The atlas could not be opened</h1>
          <p>The permanent text records are still available while the interactive view recovers.</p>
          <Link className="primary-link" to="/eras/black-empire">Open the era dossier</Link>
        </main>
      );
    }
    return this.props.children;
  }
}
