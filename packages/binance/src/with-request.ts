import { join } from 'path';
import { encode } from 'querystring';

import { RequestMethod, withRequest as withCoreRequest } from '@quantform/core';

import { useOptions } from './use-options';

export function withRequest(args: {
  method: RequestMethod;
  patch: string;
  query: Record<string, string | number | undefined>;
  headers?: Record<string, any>;
}) {
  const { apiUrl } = useOptions();

  const url = join(apiUrl, args.patch);
  const query = encode(args.query);

  return withCoreRequest({
    method: args.method,
    url: `${url}?${query}`,
    headers: args.headers ?? {}
  });
}
