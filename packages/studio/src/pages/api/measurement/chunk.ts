import { Layout } from '../../../modules/charting/charting-layout';
import { transformLayout } from '../../../modules/charting/charting-layout-transformer';
import { getSession } from '../../../modules/session/session-accessor';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const { from, to } = req.query;

  const session = getSession();
  const descriptor = session.descriptor as any;
  const layout = descriptor.layout as Layout;

  const measurements = await session.descriptor.measurement.query(session.descriptor.id, {
    count: 10000,
    from,
    to
  });

  const payload = transformLayout(measurements, layout);

  res.status(200).json(payload);
}
