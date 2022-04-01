import { getSession } from '../../../modules/session/session-accessor';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return;
  }

  const session = getSession();

  const payload = await session.descriptor.measurement.index();

  res.status(200).json(payload);
}
