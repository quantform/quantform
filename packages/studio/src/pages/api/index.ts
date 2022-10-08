import { toSessionModel } from '../../models';
import { getServerSession } from '../../services/session-manager';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const timestamp = Number(req.query.timestamp);

  const session = getServerSession();

  res.status(200).json({
    session: toSessionModel(session, timestamp)
  });
}
