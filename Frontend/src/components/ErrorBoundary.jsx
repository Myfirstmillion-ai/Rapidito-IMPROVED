import { Component } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Prevents white screen crashes and provides user-friendly error UI
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * 
 * @param {Object} props
 * @param {Function} props.onReset - Optional callback when user clicks retry
 * @param {string} props.fallbackUrl - Optional URL to navigate on "Go Home" (default: '/')
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    // Store error details in state
    this.setState({ error, errorInfo });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
    
    // Reset the error boundary state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleGoHome = () => {
    // Navigate to home page (fallback URL or root)
    const fallbackUrl = this.props.fallbackUrl || '/';
    window.location.href = fallbackUrl;
  };

  render() {
    if (this.state.hasError) {
      // Render error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-red-400/30">
                <AlertTriangle size={40} className="text-red-400" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-white text-center mb-3">
              Algo salió mal
            </h1>

            {/* Error Message */}
            <p className="text-slate-300 text-center mb-6">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página o volver al inicio.
            </p>

            {/* Error Details (only in development) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 bg-black/30 rounded-lg p-4 border border-white/10">
                <summary className="text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
                  Detalles del error (solo en desarrollo)
                </summary>
                <div className="mt-3 text-xs text-red-400 font-mono overflow-auto max-h-40">
                  <p className="font-semibold mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <RefreshCcw size={20} />
                Reintentar
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95 border border-white/20 flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
