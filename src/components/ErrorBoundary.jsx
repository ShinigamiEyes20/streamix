import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Avoid logging user-facing runtime errors or request details to the console.
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page" role="alert">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <p>Streamix hit a temporary problem. Try reloading this page.</p>
            <button className="back-home-btn" onClick={this.handleRetry}>Retry</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
