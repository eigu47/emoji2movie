import cloudDb from '@/db/cloud';
import { session } from '@/db/cloud/schema';
import { eq, sql } from 'drizzle-orm';

type SessionInsert = typeof session.$inferInsert;

export const getSessionById = cloudDb.query.session
  .findFirst({
    columns: {
      id: true,
      movieId: true,
      streak: true,
      bestStreak: true,
    },
    where: ({ id }, { eq }) => eq(id, sql.placeholder('id')),
  })
  .prepare();

export async function insertSession(newSession: SessionInsert) {
  const res = await cloudDb.insert(session).values(newSession).returning();
  return res[0];
}

export async function updateSession({
  id,
  ...data
}: Pick<SessionInsert, 'id'> &
  Partial<Pick<SessionInsert, 'movieId' | 'streak' | 'bestStreak'>>) {
  const res = await cloudDb
    .update(session)
    .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(session.id, id))
    .returning();
  return res[0];
}
