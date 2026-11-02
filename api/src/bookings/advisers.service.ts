import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { DB, type Db } from '../db';
import { member, user } from '../db/schema';

const fields = { id: user.id, name: user.name, image: user.image, calLink: user.calLink, profile: user.adviserProfile };

/** A tenant's advisers: its members with role adviser (Better Auth stores several roles comma-separated) who have set a Cal.com link. */
@Injectable()
export class AdvisersService {
  constructor(@Inject(DB) private readonly db: Db) {}

  list = (organizationId: string, id?: string) =>
    this.db.select(fields).from(member).innerJoin(user, eq(user.id, member.userId))
      .where(and(
        eq(member.organizationId, organizationId),
        sql`'adviser' = any(string_to_array(${member.role}, ','))`,
        isNotNull(user.calLink),
        id ? eq(user.id, id) : undefined,
      ))
      .orderBy(member.createdAt, user.id); // in the order they joined
}
