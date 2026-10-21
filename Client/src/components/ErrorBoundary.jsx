import React from "react";
import ErrorPage from "../pages/ErrorPage.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled rendering error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          type="something-went-wrong"
          error={this.state.error}
          onRetry={this.resetError}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
