# Tallinn Live Transport - React Version

React-based migration of the vanilla JavaScript realtime transport visualizer.

## Project Status

**Phase 1: Infrastructure** ✅ COMPLETE

- ✅ Vite + React + TypeScript setup
- ✅ Dependencies installed (React-Leaflet, Zustand, React Query, Leaflet)
- ✅ Shared API module created (`../shared/api.js`)
- ✅ TypeScript types defined (`src/types/`)
- ✅ Zustand store configured (`src/store/mapStore.ts`)
- ✅ Build verified successfully

**Phase 2: Basic Map & Geolocation** ✅ COMPLETE

- ✅ React-Leaflet map component with OpenStreetMap tiles
- ✅ useGeolocation hook for browser geolocation
- ✅ LocationButton component to center map on user
- ✅ FeedbackButton component for user feedback
- ✅ UserLocationMarker component showing current position
- ✅ Full-screen map with proper styling

**Phase 3: Vehicle Tracking & Animations** ✅ COMPLETE

- ✅ VehiclesLayer component with React Query (6-second updates)
- ✅ VehicleMarker component with smooth RAF-based animations
- ✅ useAnimatedMarker hook for 60fps position interpolation
- ✅ Smooth rotation animations matching vanilla implementation
- ✅ Vehicle line numbers overlaid on markers
- ✅ Service interruption warnings integration
- ✅ Vehicle filtering based on route selection

**Phase 4: Stop Markers** ✅ COMPLETE

- ✅ StopsLayer with zoom-based visibility (desktop: 15+, mobile: 14+)
- ✅ Bounds-based filtering for performance optimization
- ✅ StopMarker component with click-to-view-departures
- ✅ StopPopupContent showing real-time vs scheduled departures
- ✅ Next 3 departure times per route with delay indicators
- ✅ Vehicle icons with line numbers in popup
- ✅ Service interruption warnings in popup

**Phase 5: Route Selection & Visualization** ✅ COMPLETE

- ✅ RoutePolyline component for drawing selected routes
- ✅ MapClickHandler for route deselection (double-click)
- ✅ useRoute hook for fetching route geometry
- ✅ Vehicle opacity filtering by selected route
- ✅ Route selection from stop departure clicks
- ✅ Route data caching (1 hour)

**Phase 6: Polish & Testing** ✅ COMPLETE

- ✅ Clean up console logs
- ✅ Performance optimization (map event debouncing, memoization)
- ✅ Marker component optimization (memoized calculations)
- ✅ Production build optimization
- ✅ Testing and validation
- ✅ Bug fixes: Hidden vehicles no longer show popups when clicked

## Development

### Prerequisites

- **Node.js 20.19+ or 22.12+** (Vite 7.x requirement)
- npm 10+

**Note:** This project uses **nvm (Node Version Manager)** to manage Node.js versions.

- System Node.js: v18.20.4 (Debian package)
- Project Node.js: **v22.21.0 LTS** (via nvm)

### First Time Setup

If you haven't used this project before, nvm is already configured. Just open a new terminal and the correct Node version will be used automatically.

To manually activate the correct Node version:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use default
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

**Option 1: Using the helper script (recommended)**
```bash
./dev.sh
```

**Option 2: Manual**
```bash
# Load nvm and run
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

The React version will be available at `http://localhost:5173` (default Vite port).

### Build for Production

**Option 1: Using the helper script (recommended)**
```bash
./build.sh
```

**Option 2: Manual**
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
react/
├── src/
│   ├── components/     # React components
│   │   ├── Map.tsx                 # Main map container (React-Leaflet)
│   │   ├── VehicleMarker.tsx       # Individual vehicle marker with animations
│   │   ├── VehiclesLayer.tsx       # Manages all vehicle markers
│   │   ├── StopMarker.tsx          # Individual stop marker
│   │   ├── StopPopupContent.tsx    # Stop departure information popup
│   │   ├── StopsLayer.tsx          # Manages stop markers with filtering
│   │   ├── RoutePolyline.tsx       # Selected route visualization
│   │   ├── MapClickHandler.tsx     # Map interaction handler
│   │   ├── LocationButton.tsx      # User location button
│   │   ├── FeedbackButton.tsx      # Feedback link button
│   │   └── UserLocationMarker.tsx  # User position marker
│   ├── hooks/          # Custom hooks
│   │   ├── useVehicles.ts         # Vehicle data fetching (React Query)
│   │   ├── useStops.ts            # Stop data fetching (React Query)
│   │   ├── useRoute.ts            # Route geometry fetching (React Query)
│   │   ├── useInterruptions.ts    # Service interruptions fetching
│   │   ├── useAnimatedMarker.ts   # RAF-based marker animation
│   │   └── useGeolocation.ts      # Browser geolocation hook
│   ├── store/          # Zustand state management
│   │   └── mapStore.ts # Global map state
│   ├── styles/         # Component-specific styles
│   │   └── stopPopup.css  # Stop popup styling
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx         # Main app component
│   ├── App.css         # App-specific styles
│   ├── index.css       # Global styles
│   └── main.tsx        # Entry point
├── public/
│   └── assets/         # Static assets (SVG icons)
├── shared/             # Shared code with vanilla version
│   ├── api.js          # API fetch functions
│   ├── api.d.ts        # TypeScript declarations for API
│   ├── constants.js    # Constants and mappings
│   ├── constants.d.ts  # TypeScript declarations for constants
│   ├── utils.js        # Utility functions
│   └── utils.d.ts      # TypeScript declarations for utils
├── dev.sh              # Development server script
├── build.sh            # Production build script
└── index.html          # HTML entry point with Leaflet CSS
```

## Running Both Versions Side-by-Side

1. **Vanilla version**: `../realtime.html` (original implementation)
2. **React version**: Run `npm run dev` in this directory

Both versions will use the same backend API endpoints and can be tested simultaneously.

## Migration Strategy

This is a **gradual migration** where the React version is being built alongside the vanilla version. Key principles:

- **Shared API layer**: Both versions use the same API functions from `../shared/api.js`
- **Identical animations**: React version will replicate the 6-second RAF-based animations
- **Component-based architecture**: Easier to add new features and maintain
- **Type safety**: TypeScript provides better developer experience

## Features Implemented

### ✅ Completed Features

- **Interactive Map**: Full-screen Leaflet map centered on Tallinn
- **User Location**: Browser geolocation with visual marker
- **Location Centering**: Button to center map on user's current position
- **Continuous Tracking**: Watch user position for real-time updates
- **Feedback Integration**: Link to user feedback form
- **Responsive Design**: Works on mobile and desktop

- **Real-Time Vehicle Tracking**:
  - Live vehicle positions updated every 6 seconds
  - Smooth RAF-based animations (60fps) between updates
  - Vehicle rotation animations based on direction
  - Line numbers overlaid on vehicle icons
  - Service interruption warnings (yellow text)
  - Filtering by selected route

- **Stop Markers**:
  - Zoom-based visibility (desktop: 15+, mobile: 14+)
  - Performance-optimized with bounds filtering
  - Click stop to view departures
  - Real-time vs scheduled departure indicators
  - Next 3 departure times per route
  - Delay/early indicators (+3 min, -2 min)
  - Service interruption warnings in popup

- **Route Visualization**:
  - Click departure in stop popup to select route
  - Click vehicle marker to show its route
  - Blue polyline showing full route geometry
  - Vehicles not on selected route fade out (opacity: 0)
  - Hidden vehicles don't show popups when clicked
  - Double-click map to deselect route
  - Route data cached for 1 hour

### ✅ All Features Complete

All phases (1-6) have been completed successfully. The React version has full feature parity with the vanilla version plus additional improvements:

- Complete vehicle tracking with smooth animations
- Full stop marker integration with departures
- Route selection and visualization
- Performance optimizations (memoization, debouncing)
- Production build ready
- Bug fixes applied (hidden vehicle popups fixed)

## Dependencies

- **react**: ^19.0.0 - UI framework
- **react-leaflet**: ^5.0.0 - React bindings for Leaflet
- **leaflet**: ^1.9.4 - Map library
- **zustand**: ^5.0.3 - State management
- **@tanstack/react-query**: ^5.0.0 - Data fetching and caching

## Troubleshooting

### Node.js Version Issues

If you see "Vite requires Node.js version 20.19+ or 22.12+" error:

1. Make sure nvm is loaded:
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

2. Check active Node version:
   ```bash
   node --version  # Should show v22.21.0
   ```

3. If it shows v18.x, switch to the correct version:
   ```bash
   nvm use default
   ```

4. Use the helper scripts (`./dev.sh` or `./build.sh`) which handle this automatically.

## Current Status

✅ **All Phases Complete** - 100% Feature Parity + Enhanced Performance

The React version implements all features from the vanilla version with improved architecture:

**Core Features:**
- ✅ Real-time vehicle tracking with smooth 60fps animations
- ✅ Stop markers with departure information
- ✅ Route selection and visualization
- ✅ User geolocation and map controls
- ✅ Service interruption warnings

**Performance Optimizations:**
- ✅ React Query caching (stops: infinite, routes: 1 hour, vehicles: 6 seconds)
- ✅ Bounds filtering for stop markers
- ✅ Map event debouncing (update only on moveend/zoomend)
- ✅ Component memoization (memo, useMemo, useCallback)
- ✅ Direct Leaflet manipulation for animations
- ✅ Memoized calculations in all marker components
- ✅ Console logs removed for production

**✅ Migration Complete!** The React version is fully functional, performant, and ready for deployment. Test at `http://localhost:5173/`
