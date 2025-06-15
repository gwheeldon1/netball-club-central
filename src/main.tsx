
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import './index.css'
import { initPerformanceMonitoring, preloadCriticalResources } from './utils/bundleAnalyzer';

// Initialize performance monitoring in development
initPerformanceMonitoring();

// Preload critical resources
preloadCriticalResources();

// Create root and render app
createRoot(document.getElementById("root")!).render(<App />);
