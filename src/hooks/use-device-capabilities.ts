import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  hasCoarsePointer: boolean;
  hasFinePointer: boolean;
  isPWA: boolean;
  isTouchDevice: boolean;
}

/**
 * Hook to detect device capabilities and PWA mode
 * Provides a more robust alternative to CSS media queries
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    hasCoarsePointer: false,
    hasFinePointer: false,
    isPWA: false,
    isTouchDevice: false,
  });

  useEffect(() => {
    const updateCapabilities = () => {
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone === true ||
                   document.referrer.includes('android-app://');
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setCapabilities({
        hasCoarsePointer,
        hasFinePointer,
        isPWA,
        isTouchDevice,
      });
    };

    // Initial check
    updateCapabilities();

    // Listen for changes (e.g., when connecting/disconnecting external mouse)
    const mediaQueries = [
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(display-mode: standalone)')
    ];

    const handleChange = () => updateCapabilities();
    
    mediaQueries.forEach(mq => {
      if (mq.addEventListener) {
        mq.addEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mq.addListener(handleChange);
      }
    });

    return () => {
      mediaQueries.forEach(mq => {
        if (mq.removeEventListener) {
          mq.removeEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mq.removeListener(handleChange);
        }
      });
    };
  }, []);

  return capabilities;
}