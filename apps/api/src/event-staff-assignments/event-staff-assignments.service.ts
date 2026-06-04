import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventStaffAssignmentRelationalRepository } from './infrastructure/persistence/relational/repositories/event-staff-assignment.repository';
import { EventStaffAssignment } from './domain/event-staff-assignment';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { EventEntity } from '../events/infrastructure/persistence/relational/entities/event.entity';
import { RoleEnum } from '../roles/roles.enum';

export interface StaffWithUser extends EventStaffAssignment {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

@Injectable()
export class EventStaffAssignmentsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly repo: EventStaffAssignmentRelationalRepository,
  ) {}

  private async loadEvent(eventId: string): Promise<EventEntity> {
    const event = await this.dataSource
      .getRepository(EventEntity)
      .findOne({ where: { id: eventId }, loadEagerRelations: false });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  private assertOwner(
    event: EventEntity,
    requesterId: string,
    isAdmin: boolean,
  ) {
    if (!isAdmin && String(event.organizerId) !== requesterId) {
      throw new ForbiddenException('Not the event owner');
    }
  }

  async assign(
    eventId: string,
    staffId: string,
    requesterId: string,
    isAdmin: boolean,
  ): Promise<EventStaffAssignment> {
    const event = await this.loadEvent(eventId);
    this.assertOwner(event, requesterId, isAdmin);

    const userRepo = this.dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({
      where: { id: Number(staffId) },
      loadEagerRelations: true,
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role?.id !== RoleEnum.staff) {
      throw new BadRequestException('User is not a Staff member.');
    }

    const existing = await this.repo.findOne(eventId, staffId);
    if (existing) {
      throw new ConflictException('Staff already assigned to this event.');
    }

    return this.repo.create({ eventId, staffId });
  }

  async remove(
    eventId: string,
    staffId: string,
    requesterId: string,
    isAdmin: boolean,
  ): Promise<void> {
    const event = await this.loadEvent(eventId);
    this.assertOwner(event, requesterId, isAdmin);
    await this.repo.remove(eventId, staffId);
  }

  async listByEvent(
    eventId: string,
    requesterId: string,
    isAdmin: boolean,
  ): Promise<StaffWithUser[]> {
    const event = await this.loadEvent(eventId);
    this.assertOwner(event, requesterId, isAdmin);

    const assignments = await this.repo.findByEvent(eventId);
    const staffIds = assignments.map((a) => Number(a.staffId));
    if (!staffIds.length) return [];

    const users = await this.dataSource
      .getRepository(UserEntity)
      .findByIds(staffIds);

    const userMap = new Map(users.map((u) => [String(u.id), u]));

    return assignments.map((a) => {
      const u = userMap.get(a.staffId);
      return {
        ...a,
        firstName: u?.firstName ?? null,
        lastName: u?.lastName ?? null,
        email: u?.email ?? null,
      };
    });
  }

  async isAssigned(eventId: string, staffId: string): Promise<boolean> {
    const assignment = await this.repo.findOne(eventId, staffId);
    return assignment !== null;
  }
}
