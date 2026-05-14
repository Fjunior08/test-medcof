import { describe, expect, it, jest } from '@jest/globals';
import { ZodError } from 'zod';
import type { CreateTaskUseCase } from '@application/use-cases/create-task.use-case.js';
import type { BulkCreateTasksUseCase } from '@application/use-cases/bulk-create-tasks.use-case.js';
import type { ListTasksUseCase } from '@application/use-cases/list-tasks.use-case.js';
import type { GetTaskByIdUseCase } from '@application/use-cases/get-task-by-id.use-case.js';
import type { UpdateTaskUseCase } from '@application/use-cases/update-task.use-case.js';
import type { DeleteTaskUseCase } from '@application/use-cases/delete-task.use-case.js';
import { TasksController } from '@infrastructure/http/controllers/tasks.controller.js';
import { UnauthorizedError } from '@shared/errors/unauthorized.error.js';
import { TaskNotFoundError } from '@shared/errors/task-not-found.error.js';
import { buildAuthenticatedUser } from '../factories/auth.factory.js';
import { createMockResponse, createRequest } from '../factories/http.js';

function createController(deps: {
  createTask?: { execute: jest.Mock };
  bulkCreateTasks?: { execute: jest.Mock };
  listTasks?: { execute: jest.Mock };
  getTaskById?: { execute: jest.Mock };
  updateTask?: { execute: jest.Mock };
  deleteTask?: { execute: jest.Mock };
}) {
  const defaults = {
    createTask: { execute: jest.fn() },
    bulkCreateTasks: { execute: jest.fn() },
    listTasks: { execute: jest.fn() },
    getTaskById: { execute: jest.fn() },
    updateTask: { execute: jest.fn() },
    deleteTask: { execute: jest.fn() },
  };
  const merged = { ...defaults, ...deps };
  return new TasksController(
    merged.createTask as unknown as CreateTaskUseCase,
    merged.bulkCreateTasks as unknown as BulkCreateTasksUseCase,
    merged.listTasks as unknown as ListTasksUseCase,
    merged.getTaskById as unknown as GetTaskByIdUseCase,
    merged.updateTask as unknown as UpdateTaskUseCase,
    merged.deleteTask as unknown as DeleteTaskUseCase,
  );
}

describe('TasksController', () => {
  it('creates a task and responds with 201 envelope', async () => {
    const dto = {
      id: 't1',
      title: 'A',
      description: null,
      status: 'PENDING',
      ownerId: 'u1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const createTask = { execute: jest.fn(async () => dto) };
    const controller = createController({ createTask });
    const req = createRequest({
      user: buildAuthenticatedUser({ id: 'u1' }),
      body: { title: 'A' },
    });
    const { res, status, json } = createMockResponse();

    await controller.create(req, res);

    expect(createTask.execute).toHaveBeenCalledWith({ ownerId: 'u1', title: 'A', description: undefined });
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ success: true, data: { task: dto } });
  });

  it('rejects with ZodError when body is invalid', async () => {
    const controller = createController({});
    const req = createRequest({
      user: buildAuthenticatedUser(),
      body: { title: '' },
    });
    const { res, status, json } = createMockResponse();

    await expect(controller.create(req, res)).rejects.toBeInstanceOf(ZodError);
    expect(status).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });

  it('rejects with UnauthorizedError when user is missing (defensive)', async () => {
    const controller = createController({});
    const req = createRequest({ body: { title: 'Valid title here' } });
    const { res } = createMockResponse();

    await expect(controller.create(req, res)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects with use case errors (e.g. not found) for global handler', async () => {
    const getTaskById = {
      execute: jest.fn(async () => {
        throw new TaskNotFoundError('missing');
      }),
    };
    const controller = createController({ getTaskById });
    const req = createRequest({
      user: buildAuthenticatedUser(),
      params: { taskId: 'missing' },
    });
    const { res, status, json } = createMockResponse();

    await expect(controller.getById(req, res)).rejects.toBeInstanceOf(TaskNotFoundError);
    expect(status).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });
});
