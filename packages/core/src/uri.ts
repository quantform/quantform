export type Uri<T> = {
  base: `${string}://${string}`;
  params: T;
  query: string;
};

export function uri<T extends Record<string, string | number>>(
  base: `${string}://${string}`,
  params: T
) {
  const search = new URLSearchParams();

  for (const [k, v] of Object.entries(params)) {
    search.set(k, String(v));
  }

  return {
    base,
    params,
    query: `${base}?${search.toString()}`
  };
}
