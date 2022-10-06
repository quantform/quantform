import { SessionModel, toSessionModel } from '../../models/SessionModel';
import { getServerSession } from '../../services/session-manager';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const { timestamp } = req.query;

  //const session = getServerSession();

  const sessionModel: SessionModel = {
    balances: [],
    orders: [],
    positions: []
  };

  res.status(200).json({
    session: sessionModel
  });
}
