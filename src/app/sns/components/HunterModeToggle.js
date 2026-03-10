'use client';

import { useEffect, useRef } from 'react';

const SEQUENCE = ['k', 'a', 'i', 'i', 'k', 'i', 'l', 'l'];

export default function HunterModeToggle({ onToggle }) {
  const bufferRef = useRef([]);

  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key.toLowerCase();
      bufferRef.current.push(key);

      // Keep only last 8 keys
      if (bufferRef.current.length > SEQUENCE.length) {
        bufferRef.current = bufferRef.current.slice(-SEQUENCE.length);
      }

      // Check for match
      if (bufferRef.current.length === SEQUENCE.length) {
        const matches = bufferRef.current.every((k, i) => k === SEQUENCE[i]);
        if (matches) {
          bufferRef.current = [];

          // Read current state, toggle it
          const current = localStorage.getItem('hunterMode') === 'true';
          const next = !current;
          localStorage.setItem('hunterMode', String(next));

          // Trigger glitch animation
          const page = document.querySelector('.sns-page');
          if (page) {
            page.classList.add('sns-page--glitch');
            setTimeout(() => {
              page.classList.remove('sns-page--glitch');
            }, 600);
          }

          onToggle?.(next);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  return null;
}
