import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import type { PrismaClient } from '@prisma/client';
import type { UserRepositoryPort } from '@domain/ports/user-repository.port.js';
import type { User } from '@domain/entities/user.entity.js';
import type { Email } from '@domain/value-objects/email.vo.js';
import type { UserId } from '@domain/value-objects/user-id.vo.js';
import {
  mapUserAggregateToCreateFields,
  mapUserAggregateToUpdateFields,
  mapUserRowToAggregate,
} from './prisma/mappers/user.prisma-mapper.js';
import { ConflictError } from '@shared/errors/conflict.error.js';

export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    const create = mapUserAggregateToCreateFields(user);
    const update = mapUserAggregateToUpdateFields(user);
    await this.prisma.user.upsert({
      where: { id: create.id },
      create,
      update,
    });
  }

  async tryCreate(user: User): Promise<void> {
    const data = mapUserAggregateToCreateFields(user);
    try {
      await this.prisma.user.create({ data });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('An account with this email already exists');
      }
      throw err;
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id: id.value } });
    return row === null ? null : mapUserRowToAggregate(row);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.value } });
    return row === null ? null : mapUserRowToAggregate(row);
  }
}
