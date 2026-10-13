import { useCallback, useEffect, useMemo, useState } from 'react';

const KEY = 'backlog.library.v1';

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value.filter((e) => e && typeof e.id === 'string') : [];
  } catch {
    return [];
  }
}

/** Library entries ({ id, addedAt }) persisted to localStorage, newest first. */
export function useLibrary() {
  const [entries, setEntries] = useState(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable — library stays in memory */
    }
  }, [entries]);

  const ids = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);
  const has = useCallback((id) => ids.has(id), [ids]);

  const add = useCallback((id, addedAt = Date.now()) => {
    setEntries((prev) =>
      prev.some((e) => e.id === id)
        ? prev
        : [...prev, { id, addedAt }].sort((a, b) => b.addedAt - a.addedAt),
    );
  }, []);

  const remove = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, has, add, remove, size: entries.length };
}
