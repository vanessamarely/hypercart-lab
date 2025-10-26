import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
// import "@github/spark/spark" // Commented out to avoid GitHub API calls

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
