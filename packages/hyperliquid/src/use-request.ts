import { join } from 'path';

import { useOptions } from '@lib/use-options';
import { withRequest as withCoreRequest } from '@quantform/core';

export function useRequest(args: { patch: '/info'; body: Record<string, any> }) {
  const { rest } = useOptions();

  const url = join(rest.url, args.patch);

  return withCoreRequest({
    method: 'POST',
    url,
    body: JSON.stringify(args.body),
    headers: { 'Content-Type': 'application/json' }
  });
}
