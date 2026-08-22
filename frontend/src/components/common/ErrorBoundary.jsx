import { Component } from "react";
import { Button } from "@/components/ui/button";

/**
 * Catches uncaught errors anywhere in the component tree below it and
 * renders a fallback instead of an unstyled white screen. Must be a
 * class component — React only supports error boundaries via
 * componentDidCatch/getDerivedStateFromError, there's no hook equivalent.
 *
 * Mounted once around the whole app (see main.jsx). Does not catch
 * errors in event handlers or async code (e.g. a rejected promise in a
 * form submit) — those are handled locally where they occur (try/catch
 * + toast.error), which is the right place for them anyway since a
 * failed API call shouldn't take down the whole page.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught render error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
          <div className="space-y-4">
            <h1 className="font-display text-xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Reloading the page usually fixes it.
            </p>
            <Button onClick={this.handleReload}>Reload page</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
