import * as applicationService from '../services/application.service.js';

export async function list(req, res) {
  const { items, meta } = await applicationService.listApplications(
    req.user.id,
    req.validated.query,
  );
  res.json({ data: items, meta });
}

export async function board(req, res) {
  res.json({ data: await applicationService.getBoard(req.user.id) });
}

export async function followUps(req, res) {
  res.json({ data: await applicationService.getDueFollowUps(req.user.id) });
}

export async function getOne(req, res) {
  res.json({ data: await applicationService.getApplication(req.user.id, req.validated.params.id) });
}

export async function create(req, res) {
  const application = await applicationService.createApplication(req.user.id, req.validated.body);
  res.status(201).json({ data: application });
}

export async function update(req, res) {
  const application = await applicationService.updateApplication(
    req.user.id,
    req.validated.params.id,
    req.validated.body,
  );
  res.json({ data: application });
}

export async function remove(req, res) {
  await applicationService.deleteApplication(req.user.id, req.validated.params.id);
  res.status(204).end();
}
