import { useCallback, useState } from 'react';

export function useLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async function load<T>(
    cb: () => Promise<T> | T
  ): Promise<T> {
    setIsLoading(true);
    try {
      return await cb();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [isLoading, load] as const;
}
