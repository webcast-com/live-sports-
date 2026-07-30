import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { initWebVitals, initPerformanceObserver } from "./utils/webVitals";

// Phase 2: Initialize performance monitoring
initWebVitals();
initPerformanceObserver();

createRoot(document.getElementById("root")!).render(<App />);
