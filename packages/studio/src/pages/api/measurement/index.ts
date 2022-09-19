import { Measurement } from '@quantform/core';

import { getServerSession } from '../../../services/session-manager';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const session = getServerSession();
  const measurement = new Measurement(session.descriptor.storage('measurement'));

  const payload = await measurement.index();

  res.status(200).json(payload);
}
