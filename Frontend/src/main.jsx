import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import UserContext from "./contexts/UserContext.jsx";
import CaptainContext from "./contexts/CaptainContext.jsx";
import SocketContext from "./contexts/SocketContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx"; // MEDIUM-002: Global Error Boundary

/**
 * Swiss Minimalist Luxury App Entry Point
 * 
 * Context Provider Hierarchy (prevents "Context is undefined" errors):
 * SocketContext → UserContext → CaptainContext → App
 * 
 * This order ensures:
 * 1. Socket is available to all user/captain operations
 * 2. User context is available before captain context
 * 3. Both contexts are available throughout the app
 */

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find root element. Ensure index.html contains <div id=\"root\"></div>");
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <SocketContext>
      <UserContext>
        <CaptainContext>
          <App />
        </CaptainContext>
      </UserContext>
    </SocketContext>
  </ErrorBoundary>
);
