/**
 * MenuDrawer component - Slide-in menu with project info and feedback
 */

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-350px',
          width: '350px',
          maxWidth: '90vw',
          height: '100vh',
          backgroundColor: '#ffffff',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
          zIndex: 9999,
          transition: 'right 0.3s ease-out',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header with close button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
            Menu
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
            }}
            aria-label="Close menu"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', flex: 1 }}>
          {/* Project Info Section */}
          <section style={{ marginBottom: '30px' }}>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#333',
              }}
            >
              About
            </h3>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#666',
                margin: '0 0 12px 0',
              }}
            >
              Tallinn Live Transport is a real-time public transport tracking
              system for Tallinn's buses, trams, trolleys, and trains.
            </p>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#666',
                margin: '0 0 12px 0',
              }}
            >
              This tool collects and visualizes GPS data from transport vehicles, 
              enabling real-time tracking. Vehicles have up to 10 seconds delay from their real location. For trains, the delay can be bigger.
            </p>
             <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#666',
                margin: '0 0 12px 0',
              }}
            >
              When stop time is green then its vehicle estimated arrival time based on their location. 
              When its gray then its arrival time based on schedule.
                         </p>
            <div
              style={{
                fontSize: '13px',
                color: '#888',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <div style={{ marginBottom: '6px' }}>
                <strong>Data Sources:</strong>
              </div>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '4px' }}>TLT GPS Feed</li>
                <li style={{ marginBottom: '4px' }}>Elron Real-time API</li>
                <li style={{ marginBottom: '4px' }}>GTFS Static Data</li>
              </ul>
            </div>
          </section>

          {/* Feedback Section */}
          <section>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#333',
              }}
            >
              Feedback
            </h3>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#666',
                margin: '0 0 16px 0',
              }}
            >
              Have suggestions or found a bug? Use form below
            </p>
            <a
              href="https://tally.so/r/meb90O"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#2196F3',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1976D2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2196F3';
              }}
            >
              Give Feedback
            </a>
          </section>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e0e0e0',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center',
          }}
        >
          Version 2.0 - React
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
