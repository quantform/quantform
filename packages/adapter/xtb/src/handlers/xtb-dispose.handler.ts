import { AdapterDisposeCommand, AdapterContext } from '@quantform/core';
import { XtbAdapter } from '../xtb-adapter';

export async function XtbDisposeHandler(
  command: AdapterDisposeCommand,
  context: AdapterContext,
  xtb: XtbAdapter
): Promise<void> {
  await xtb.endpoint.disconnect();
}
