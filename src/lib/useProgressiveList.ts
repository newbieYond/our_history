import { useEffect, useState } from "react";

export function useProgressiveList<T>(
  items: T[],
  filterKey: string,
  step = 24,
) {
  const [page, setPage] = useState({ key: filterKey, limit: step });
  useEffect(() => setPage({ key: filterKey, limit: step }), [filterKey, step]);
  const limit = page.key === filterKey ? page.limit : step;
  return {
    visibleItems: items.slice(0, limit),
    showMore: () => setPage({ key: filterKey, limit: limit + step }),
    showAll: () => setPage({ key: filterKey, limit: items.length }),
  };
}
