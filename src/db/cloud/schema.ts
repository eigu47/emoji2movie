import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const emoji = sqliteTable('emoji', {
  id: integer().primaryKey(),
  emoji: text().notNull(),
  createdAt: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const session = sqliteTable('session', {
  id: text().primaryKey(),
  movieId: text().notNull(),
  streak: integer().notNull().default(0),
  bestStreak: integer().notNull().default(0),
  createdAt: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text()
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
