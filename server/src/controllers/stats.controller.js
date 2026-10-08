import * as statsService from '../services/stats.service.js';

export async function overview(req, res) {
  res.json({ data: await statsService.getOverview(req.user.id) });
}
