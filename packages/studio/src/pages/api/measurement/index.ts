import { Measurement } from '@quantform/core';
import { getSession } from '../../../modules/session/session-accessor';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const session = getSession();
  const measurement = new Measurement(session.descriptor.storage!.create('measurement'));

  const payload = await measurement.index();

  res.status(200).json(payload);
}
