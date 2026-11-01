import { useEffect, useState } from 'react';

/** Returns the value after it has stopped changing for `ms`, so typing doesn't fire a request per key. */
export default function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
