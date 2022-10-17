import { toMeasurementModel, toSessionModel } from '../../models';
import { getSessionContext } from '../../services';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const timestamp = Number(req.query.timestamp);

  const { session, layout } = getSessionContext();

  if (!session || !layout) {
    throw new Error('missing session context');
  }

  const measurement = session.measurement;

  if (!measurement) {
    throw new Error('');
  }

  const measure = await measurement.query(session.id, {
    count: 10000,
    from: 0
  });

  res.status(200).json({
    session: toSessionModel(session, timestamp),
    measurement: toMeasurementModel(measure, layout)
  });
}
