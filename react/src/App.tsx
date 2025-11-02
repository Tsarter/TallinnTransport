/**
 * Main App component for Tallinn Live Transport (React version)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Map } from './components/Map';
import { LocationButton } from './components/LocationButton';
import { HamburgerMenu } from './components/HamburgerMenu';
import { UserLocationMarker } from './components/UserLocationMarker';
import { VehiclesLayer } from './components/VehiclesLayer';
import { StopsLayer } from './components/StopsLayer';
import { RoutePolyline } from './components/RoutePolyline';
import { MapClickHandler } from './components/MapClickHandler';
import { Snackbar } from './components/Snackbar';
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
        <HamburgerMenu />
        <Snackbar />
      </div>
    </QueryClientProvider>
  );
}

export default App;
