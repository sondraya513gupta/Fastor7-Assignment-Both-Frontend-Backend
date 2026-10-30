import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Maximize2, Minimize2 } from 'lucide-react';

export default function MobileFrame({ children, showStatusBar = true, showHomeIndicator = true }) {
  const timeString = '9:41';

  // Smart responsive scale for desktop display
  const [scale, setScale] = useState(1);
  const [autoFit, setAutoFit] = useState(true);

  useEffect(() => {
    const computeScale = () => {
      if (window.innerWidth <= 480) {
        setScale(1);
        return;
      }

      if (!autoFit) {
        setScale(1);
        return;
      }

      // 812px height + 16px border = 828px
      const targetHeight = 828;
      // Reserve space for top toolbar + outer padding (approx 56px)
      const availableHeight = window.innerHeight - 56;

      if (availableHeight < targetHeight) {
        const computed = Math.max(0.5, Math.min(1, availableHeight / targetHeight));
        setScale(Number(computed.toFixed(3)));
      } else {
        setScale(1);
      }
    };

    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [autoFit]);

  return (
    <div className="app-viewport-wrapper">
      {/* Desktop Top Toolbar with Fit-to-Screen toggle */}
      <div className="app-top-toolbar">
        <div className="toolbar-brand">
          <span className="brand-dot"></span>
          <span>Fastor Mobile Experience</span>
        </div>
        <div className="toolbar-actions">
          <button
            type="button"
            className="toolbar-scale-btn"
            onClick={() => setAutoFit(!autoFit)}
            title={autoFit ? 'Switch to 100% fixed size' : 'Switch to auto fit screen'}
          >
            {autoFit ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{autoFit ? `Auto-Fit (${Math.round(scale * 100)}%)` : '100% Fixed'}</span>
          </button>
          <span
            className="toolbar-badge"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#6EE7B7',
              borderColor: 'rgba(16, 185, 129, 0.4)',
            }}
          >
            Live API Active
          </span>
        </div>
      </div>

      {/* Frame Scaler: Scales the exact 375x812 iPhone coordinate space to fit screen */}
      <div
        className="mobile-device-frame-scaler"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          marginBottom: scale !== 1 ? `calc((828px * ${scale}) - 828px)` : 0,
        }}
      >
        <div className="mobile-device-frame">
          {showStatusBar && (
            <header className="mobile-status-bar" aria-label="System status bar">
              <span className="status-time">{timeString}</span>
              <div className="status-icons">
                <Signal size={14} strokeWidth={2.5} />
                <Wifi size={14} strokeWidth={2.5} />
                <div className="status-battery">
                  <div className="battery-fill" />
                </div>
              </div>
            </header>
          )}

          <main className="screen-scroll-container">
            {children}
          </main>

          {showHomeIndicator && (
            <footer className="mobile-home-indicator" aria-hidden="true">
              <div className="home-bar" />
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
