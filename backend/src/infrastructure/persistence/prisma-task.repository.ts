import type { PrismaClient } from '@prisma/client';
import type { Task } from '@domain/entities/task.entity.js';
import type {
  ListTasksForOwnerCriteria,
  TaskRepositoryPort,
} from '@domain/ports/task-repository.port.js';
import type { TaskId } from '@domain/value-objects/task-id.vo.js';
import type { UserId } from '@domain/value-objects/user-id.vo.js';
import {
  mapTaskAggregateToRow,
  mapTaskRowToAggregate,
} from './prisma/mappers/task.prisma-mapper.js';
import { buildTaskListOrderBy, buildTaskListWhereForOwner } from './prisma/query/task-list.query-builder.js';

/** Tamanho de lote para `createMany` (evita payloads excessivos no MySQL). */
const TASK_CREATE_MANY_CHUNK_SIZE = 250;

export class PrismaTaskRepository implements TaskRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async save(task: Task): Promise<void> {
    const row = mapTaskAggregateToRow(task);
    await this.prisma.task.upsert({
      where: { id: row.id },
      create: row,
      update: {
        title: row.title,
        description: row.description,
        status: row.status,
        ownerId: row.ownerId,
        updatedAt: row.updatedAt,
      },
    });
  }

  async findById(id: TaskId): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({ where: { id: id.value } });
    return row === null ? null : mapTaskRowToAggregate(row);
  }

  async listForOwner(criteria: ListTasksForOwnerCriteria) {
    const where = buildTaskListWhereForOwner(criteria);
    const orderBy = buildTaskListOrderBy(criteria.sortBy, criteria.order);

    return this.prisma.$transaction(async (tx) => {
      const total = await tx.task.count({ where });
      const rows = await tx.task.findMany({
        where,
        orderBy,
        skip: criteria.skip,
        take: criteria.take,
      });
      return {
        items: rows.map((r) => mapTaskRowToAggregate(r)),
        total,
      };
    });
  }

  async createMany(tasks: Task[]): Promise<number> {
    if (tasks.length === 0) {
      return 0;
    }
    const rows = tasks.map(mapTaskAggregateToRow);
    return this.prisma.$transaction(async (tx) => {
      let inserted = 0;
      for (let i = 0; i < rows.length; i += TASK_CREATE_MANY_CHUNK_SIZE) {
        const chunk = rows.slice(i, i + TASK_CREATE_MANY_CHUNK_SIZE);
        const result = await tx.task.createMany({ data: chunk });
        inserted += result.count;
      }
      return inserted;
    });
  }

  async deleteByIdAndOwner(id: TaskId, ownerId: UserId): Promise<number> {
    const result = await this.prisma.task.deleteMany({
      where: { id: id.value, ownerId: ownerId.value },
    });
    return result.count;
  }
}
