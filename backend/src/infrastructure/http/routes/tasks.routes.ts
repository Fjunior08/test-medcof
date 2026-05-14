import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { TasksController } from '../controllers/tasks.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export interface TasksRoutesDeps {
  readonly tasksController: TasksController;
  readonly authenticateMiddleware: RequestHandler;
}

export function createTasksRouter(deps: TasksRoutesDeps): Router {
  const router = Router();
  router.use(deps.authenticateMiddleware);

  router.post('/bulk', asyncHandler((req, res) => deps.tasksController.bulkCreate(req, res)));
  router.post('/', asyncHandler((req, res) => deps.tasksController.create(req, res)));
  router.get('/', asyncHandler((req, res) => deps.tasksController.list(req, res)));
  router.get('/:taskId', asyncHandler((req, res) => deps.tasksController.getById(req, res)));
  router.patch('/:taskId', asyncHandler((req, res) => deps.tasksController.update(req, res)));
  router.delete('/:taskId', asyncHandler((req, res) => deps.tasksController.remove(req, res)));

  return router;
}
