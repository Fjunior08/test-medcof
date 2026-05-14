import type { TaskRepositoryPort } from '@domain/ports/task-repository.port.js';
import { UserId } from '@domain/value-objects/user-id.vo.js';
import type { ListTasksQuery, ListTasksResult } from '@application/dtos/task/task-commands.dto.js';
import { toTaskResponseDto } from '@application/dtos/task/task-response.dto.js';

export class ListTasksUseCase {
  constructor(private readonly tasks: TaskRepositoryPort) {}

  async execute(query: ListTasksQuery): Promise<ListTasksResult> {
    const ownerId = UserId.create(query.ownerId);
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await this.tasks.listForOwner({
      ownerId,
      skip,
      take: query.limit,
      search: query.search,
      status: query.status,
      sortBy: query.sortBy,
      order: query.order,
    });

    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

    return {
      items: items.map(toTaskResponseDto),
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    };
  }
}
