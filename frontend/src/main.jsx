// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Import the new App.css which contains the application-specific styles
import "./App.css";

// Minimal global styles (keeping index.css import for general resets, see index.css update)
import "./index.css"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  // Simple render without StrictMode (easier to reason about behavior while learning).
  <App />
);
