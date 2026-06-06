import { useState } from 'react';

export const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);
  return { page, setPage, next: () => setPage((value) => value + 1), previous: () => setPage((value) => Math.max(1, value - 1)) };
};

