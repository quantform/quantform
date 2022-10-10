import { toMeasurementModel, toSessionModel } from '../../models';
import { getStudySession } from '../../study-session';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const timestamp = Number(req.query.timestamp);

  const session = getStudySession();

  if (!session.descriptor || !session.descriptor.id) {
    throw new Error('');
  }

  const measure = await session.measurement.query(session.descriptor.id, {
    count: 10000,
    from: 0
  });

  res.status(200).json({
    session: toSessionModel(session, timestamp),
    measurement: toMeasurementModel(measure, session.layout)
  });
}
