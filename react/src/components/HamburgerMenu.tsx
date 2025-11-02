/**
 * HamburgerMenu component - Toggle button for menu drawer
 */

import { useState } from 'react';
import { MenuDrawer } from './MenuDrawer';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          right: '20px',
          top: '20px',
          zIndex: 1000,
          cursor: 'pointer',
          background: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Open menu"
      >
        {/* Hamburger Icon SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 12H21"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 6H21"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 18H21"
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <MenuDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
