import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "hsl(220 50% 8%)",
            color: "#fff",
            textAlign: "center",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.55)", maxWidth: 420, marginBottom: "1.5rem" }}>
            This page encountered an unexpected error. Please refresh to try again, or go back to the home page.
          </p>
          {this.state.error && (
            <pre
              style={{
                fontSize: "0.7rem",
                background: "rgba(255,255,255,0.06)",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                maxWidth: 560,
                width: "100%",
                overflowX: "auto",
                color: "rgba(255,100,100,0.85)",
                marginBottom: "1.5rem",
                textAlign: "left",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.65rem 1.5rem",
                borderRadius: "9999px",
                background: "#008751",
                color: "#fff",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Reload Page
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{
                padding: "0.65rem 1.5rem",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
