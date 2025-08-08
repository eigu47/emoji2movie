import { useCallback, useEffect, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  const lastCall = useRef(0);
  const timeout = useRef<NodeJS.Timeout>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeout.current !== null) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const remaining = delay - (now - lastCall.current);

      clear();

      if (remaining <= 0) {
        lastCall.current = now;
        savedCallback.current(...args);
      } else {
        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeout.current = null;
          savedCallback.current(...args);
        }, remaining);
      }
    },
    [delay, clear]
  );

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return throttled;
}
