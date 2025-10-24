/**
 * Main App component for Tallinn Live Transport (React version)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <h1>Tallinn Live Transport (React)</h1>
        <p>React version is being built... Phase 1 infrastructure is complete!</p>
        <ul>
          <li>✅ Vite + React + TypeScript setup</li>
          <li>✅ Dependencies installed (React-Leaflet, Zustand, React Query)</li>
          <li>✅ Shared API module created</li>
          <li>✅ TypeScript types defined</li>
          <li>✅ Zustand store configured</li>
          <li>⏳ Next: Implementing map components...</li>
        </ul>
      </div>
    </QueryClientProvider>
  );
}

export default App;
