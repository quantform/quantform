import { AdapterContext } from '@quantform/core';
import { XtbAdapter } from '../xtb-adapter';

export async function XtbDisposeHandler(
  context: AdapterContext,
  xtb: XtbAdapter
): Promise<void> {
  await xtb.endpoint.disconnect();
}
