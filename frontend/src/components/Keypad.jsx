import React from 'react';
import { Delete } from 'lucide-react';
import './Keypad.css';

const KEYPAD_BUTTONS = [
  { key: '1', sub: '' },
  { key: '2', sub: 'ABC' },
  { key: '3', sub: 'DEF' },
  { key: '4', sub: 'GHI' },
  { key: '5', sub: 'JKL' },
  { key: '6', sub: 'MNO' },
  { key: '7', sub: 'PQRS' },
  { key: '8', sub: 'TUV' },
  { key: '9', sub: 'WXYZ' },
  { key: '', sub: '' },
  { key: '0', sub: '' },
  { key: 'backspace', sub: '', isAction: true },
];

export default function Keypad({ onKeyPress, onBackspace }) {
  const handleClick = (item) => {
    if (item.isAction && item.key === 'backspace') {
      onBackspace?.();
    } else if (item.key) {
      onKeyPress?.(item.key);
    }
  };

  return (
    <div className="mobile-keypad" role="region" aria-label="Numeric Keypad">
      <div className="keypad-grid">
        {KEYPAD_BUTTONS.map((item, idx) => {
          if (!item.key && !item.isAction) {
            return <div key={idx} className="keypad-spacer" />;
          }

          if (item.isAction) {
            return (
              <button
                key={idx}
                type="button"
                className="keypad-btn action-btn"
                onClick={() => handleClick(item)}
                aria-label="Delete"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              className="keypad-btn number-btn"
              onClick={() => handleClick(item)}
            >
              <span className="keypad-num">{item.key}</span>
              {item.sub && <span className="keypad-letters">{item.sub}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
