import { Measurement } from '@quantform/core';

import { Layout, transformLayout } from '../../../components/charting';
import { getServerSession } from '../../../services/session-manager';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const { from, to } = req.query;

  const session = getServerSession();
  const descriptor = session.descriptor as any;
  const layout = descriptor.layout as Layout;
  const measurement = new Measurement(session.descriptor.storage('measurement'));

  const measurements = await measurement.query(session.descriptor.id, {
    count: 10000,
    from,
    to
  });

  const payload = transformLayout(measurements, layout);

  res.status(200).json(payload);
}
