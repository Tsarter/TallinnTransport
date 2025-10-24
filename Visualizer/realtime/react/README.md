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

**Phase 2-5:** Pending (see main migration plan)

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
│   ├── components/     # React components (to be added in Phase 2+)
│   ├── hooks/          # Custom hooks (useGeolocation, useAnimatedMarker, etc.)
│   ├── services/       # Service layer for API integration
│   ├── store/          # Zustand state management
│   │   └── mapStore.ts # Global map state
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── shared/             # Shared code with vanilla version
│   ├── api.js          # API fetch functions
│   ├── constants.js    # Constants and mappings
│   └── utils.js        # Utility functions
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

## Next Steps (Phase 2)

- [ ] Set up React-Leaflet map component
- [ ] Implement useGeolocation hook
- [ ] Create LocationButton and FeedbackButton components
- [ ] Feature flag system to switch between vanilla/React

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

## Project Status

✅ **Phase 1 Complete** - Infrastructure fully set up and tested:
- Vite + React + TypeScript configured
- Node.js v22.21.0 LTS via nvm
- Dependencies installed and verified
- Build system working
- Dev server running successfully on port 5173

⏳ **Next:** Phase 2 - Map components and geolocation
