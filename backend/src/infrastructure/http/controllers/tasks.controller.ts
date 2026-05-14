import type { Request, Response } from 'express';
import type { CreateTaskUseCase } from '@application/use-cases/create-task.use-case.js';
import type { BulkCreateTasksUseCase } from '@application/use-cases/bulk-create-tasks.use-case.js';
import type { ListTasksUseCase } from '@application/use-cases/list-tasks.use-case.js';
import type { GetTaskByIdUseCase } from '@application/use-cases/get-task-by-id.use-case.js';
import type { UpdateTaskUseCase } from '@application/use-cases/update-task.use-case.js';
import type { DeleteTaskUseCase } from '@application/use-cases/delete-task.use-case.js';
import { ApiResponse } from '@shared/http/api-response.js';
import { requireAuthUser } from '../utils/require-auth-user.js';
import {
  bulkCreateTasksBodySchema,
  createTaskBodySchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskBodySchema,
} from '../schemas/task.schema.js';

export class TasksController {
  constructor(
    private readonly createTask: CreateTaskUseCase,
    private readonly bulkCreateTasks: BulkCreateTasksUseCase,
    private readonly listTasks: ListTasksUseCase,
    private readonly getTaskById: GetTaskByIdUseCase,
    private readonly updateTask: UpdateTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const user = requireAuthUser(req);
    const body = createTaskBodySchema.parse(req.body);
    const result = await this.createTask.execute({
      ownerId: user.id,
      title: body.title,
      description: body.description,
    });
    ApiResponse.success(res, 201, { task: result });
  };

  bulkCreate = async (req: Request, res: Response): Promise<void> => {
    const user = requireAuthUser(req);
    const body = bulkCreateTasksBodySchema.parse(req.body);
    const result = await this.bulkCreateTasks.execute({
      ownerId: user.id,
      items: body.tasks,
    });
    ApiResponse.success(res, 201, result);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const user = requireAuthUser(req);
    const q = listTasksQuerySchema.parse(req.query);
    const result = await this.listTasks.execute({
      ownerId: user.id,
      page: q.page,
      limit: q.limit,
      search: q.search,
      status: q.status,
      sortBy: q.sortBy,
      order: q.order,
    });
    ApiResponse.success(res, 200, result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const user = requireAuthUser(req);
    const params = taskIdParamsSchema.parse(req.params);
    const result = await this.getTaskById.execute({
      ownerId: user.id,
      taskId: params.taskId,
    });
    ApiResponse.success(res, 200, { task: result });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const user = requireAuthUser(req);
    const params = taskIdParamsSchema.parse(req.params);
    const body = updateTaskBodySchema.parse(req.body);
    const result = await this.updateTask.execute({
      ownerId: user.id,
      taskId: params.taskId,
      patch: {
        title: body.title,
        description: body.description,
        clearDescription: body.clearDescription,
        status: body.status,
      },
    });
    ApiResponse.success(res, 200, { task: result });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const user = requireAuthUser(req);
    const params = taskIdParamsSchema.parse(req.params);
    await this.deleteTask.execute({
      ownerId: user.id,
      taskId: params.taskId,
    });
    ApiResponse.success(res, 200, { deleted: true });
  };
}
