import { join } from 'path';
import queryString from 'query-string';

import { RequestMethod, withRequest as withCoreRequest } from '@quantform/core';

import { useOptions } from './use-options';

export function withRequest(args: {
  method: RequestMethod;
  patch: string;
  query: Record<string, string | number | undefined>;
  body?: string;
  headers?: Record<string, any>;
}) {
  const { apiUrl } = useOptions();

  const url = join(apiUrl, args.patch);
  const query = queryString.stringify(args.query, {
    sort: false
  });

  return withCoreRequest({
    method: args.method,
    url: `${url}?${query}`,
    body: args.body,
    headers: args.headers ?? {}
  });
}
