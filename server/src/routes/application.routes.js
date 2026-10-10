import { Router } from 'express';
import * as applicationController from '../controllers/application.controller.js';
import { validate } from '../middleware/validate.js';
import {
  createApplicationSchema,
  idParamSchema,
  listQuerySchema,
  updateApplicationSchema,
} from '../validators/application.schema.js';

export const applicationRouter = Router();

applicationRouter.get('/', validate({ query: listQuerySchema }), applicationController.list);
applicationRouter.post(
  '/',
  validate({ body: createApplicationSchema }),
  applicationController.create,
);

// Fixed paths must be registered before /:id, or "board" would be treated as an id.
applicationRouter.get('/board', applicationController.board);
applicationRouter.get('/follow-ups', applicationController.followUps);

applicationRouter.get('/:id', validate({ params: idParamSchema }), applicationController.getOne);
applicationRouter.patch(
  '/:id',
  validate({ params: idParamSchema, body: updateApplicationSchema }),
  applicationController.update,
);
applicationRouter.delete('/:id', validate({ params: idParamSchema }), applicationController.remove);
