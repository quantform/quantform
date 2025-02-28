import { join } from 'path';

import { useOptions } from '@lib/use-options';
import { withRequest as withCoreRequest } from '@quantform/core';

export function useHttp(args: { patch: '/info'; body: Record<string, any> }) {
  const { http } = useOptions();

  const url = join(http.url, args.patch);

  return withCoreRequest({
    method: 'POST',
    url,
    body: JSON.stringify(args.body),
    headers: { 'Content-Type': 'application/json' }
  });
}
