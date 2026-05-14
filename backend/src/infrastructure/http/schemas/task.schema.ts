import { z } from 'zod';
import { TaskStatus } from '@domain/enums/task-status.enum.js';

const taskTitleSchema = z.string().trim().min(1).max(255);

export const createTaskBodySchema = z.object({
  title: taskTitleSchema,
  description: z
    .string()
    .max(10_000)
    .optional()
    .transform((v) => (v === undefined || v.trim() === '' ? undefined : v)),
});

export const bulkCreateTasksBodySchema = z.object({
  tasks: z
    .array(
      z.object({
        title: taskTitleSchema,
        description: z
          .string()
          .max(10_000)
          .optional()
          .transform((val) => (val === undefined || val.trim() === '' ? undefined : val)),
      }),
    )
    .min(1, 'At least one task is required')
    .max(1000, 'Bulk create is limited to 1000 tasks'),
});

export const updateTaskBodySchema = z
  .object({
    title: taskTitleSchema.optional(),
    description: z
      .string()
      .max(10_000)
      .optional()
      .transform((v) => (v === undefined ? undefined : v.trim() === '' ? undefined : v)),
    clearDescription: z.boolean().optional(),
    status: z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.DONE]).optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.description !== undefined ||
      body.clearDescription === true ||
      body.status !== undefined,
    { message: 'At least one field must be provided' },
  );

export const taskIdParamsSchema = z.object({
  taskId: z.string().trim().min(1).max(128),
});

const emptyToUndefined = (v: unknown): unknown =>
  v === '' || v === null || v === undefined ? undefined : v;

export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z
    .string()
    .max(255)
    .optional()
    .transform((s) => (s === undefined ? undefined : s.trim() === '' ? undefined : s.trim())),
  status: z.preprocess(
    emptyToUndefined,
    z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.DONE]).optional(),
  ),
  sortBy: z.preprocess(
    emptyToUndefined,
    z.enum(['title', 'createdAt', 'updatedAt', 'status']).default('updatedAt'),
  ),
  order: z.preprocess(emptyToUndefined, z.enum(['asc', 'desc']).default('desc')),
});

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type BulkCreateTasksBody = z.infer<typeof bulkCreateTasksBodySchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
export type TaskIdParams = z.infer<typeof taskIdParamsSchema>;
export type ListTasksQueryInput = z.infer<typeof listTasksQuerySchema>;
