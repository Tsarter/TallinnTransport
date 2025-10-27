/**
 * Snackbar component for displaying error messages
 * Auto-dismisses after a timeout
 */

import { useEffect } from 'react';
import { useMapStore } from '../store/mapStore';
import '../styles/snackbar.css';

export function Snackbar() {
  const error = useMapStore((state) => state.error);
  const clearError = useMapStore((state) => state.clearError);

  useEffect(() => {
    if (error) {
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div className="snackbar" role="alert">
      <div className="snackbar-content">
        <span className="snackbar-icon">⚠️</span>
        <span className="snackbar-message">{error}</span>
        <button
          className="snackbar-close"
          onClick={clearError}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
