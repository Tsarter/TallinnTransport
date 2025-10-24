/**
 * Main App component for Tallinn Live Transport (React version)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Map } from './components/Map';
import { LocationButton } from './components/LocationButton';
import { FeedbackButton } from './components/FeedbackButton';
import { UserLocationMarker } from './components/UserLocationMarker';
import { VehiclesLayer } from './components/VehiclesLayer';
import { StopsLayer } from './components/StopsLayer';
import { RoutePolyline } from './components/RoutePolyline';
import { MapClickHandler } from './components/MapClickHandler';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Refetch when window regains focus
      staleTime: 5000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Map>
          <VehiclesLayer />
          <StopsLayer />
          <RoutePolyline />
          <UserLocationMarker />
          <MapClickHandler />
          <LocationButton />
        </Map>
        <FeedbackButton />
      </div>
    </QueryClientProvider>
  );
}

export default App;
