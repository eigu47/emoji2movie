import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import * as schema from '@/db/local/schema';

const client = new Database(path.join(process.cwd(), 'local-db.db'));

const localDb = drizzle({
  client,
  schema,
  casing: 'snake_case',
});

export default localDb;
