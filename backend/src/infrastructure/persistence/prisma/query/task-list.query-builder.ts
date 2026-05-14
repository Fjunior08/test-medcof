import type { Prisma } from '@prisma/client';
import type { ListTasksForOwnerCriteria } from '@domain/ports/task-repository.port.js';

export function buildTaskListWhereForOwner(criteria: ListTasksForOwnerCriteria): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = { ownerId: criteria.ownerId.value };
  if (criteria.status !== undefined) {
    where.status = criteria.status;
  }
  if (criteria.search !== undefined && criteria.search.length > 0) {
    const term = criteria.search;
    where.OR = [{ title: { contains: term } }, { description: { contains: term } }];
  }
  return where;
}

export function buildTaskListOrderBy(
  sortBy: ListTasksForOwnerCriteria['sortBy'],
  order: ListTasksForOwnerCriteria['order'],
): Prisma.TaskOrderByWithRelationInput {
  return { [sortBy]: order };
}
