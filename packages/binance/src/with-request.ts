import { join } from 'path';
import { encode } from 'querystring';

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

  const filteredQuery = Object.keys(args.query).reduce((acc, key) => {
    if (args.query[key] === undefined) {
      return acc;
    }

    acc[key] = args.query[key];

    return acc;
  }, {} as Record<string, string | number | undefined>);

  const url = join(apiUrl, args.patch);
  const query = encode(filteredQuery);

  return withCoreRequest({
    method: args.method,
    url: `${url}?${query}`,
    body: args.body,
    headers: args.headers ?? {}
  });
}
