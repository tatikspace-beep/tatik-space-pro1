import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx"; // Entry component
import "./index.css"; // Tailwind

console.log("main.tsx: Starting React render..."); // Log 1: Start

const rootElement = document.getElementById("root");
console.log("main.tsx: Root element found?", rootElement ? "Yes" : "No"); // Log 2: #root esiste?

if (rootElement) {
  console.log("main.tsx: Creating root..."); // Log 3: Create root
  const root = ReactDOM.createRoot(rootElement);

  console.log("main.tsx: Rendering App..."); // Log 4: Render
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log("main.tsx: App rendered!"); // Log 5: Render done
} else {
  console.error("main.tsx: No #root element in index.html!");
}

// Catch global errors
window.addEventListener("error", err => {
  console.error("Global error:", err.message); // Log 6: Any JS error
});
