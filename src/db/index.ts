import env from '@/lib/env';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const db = drizzle({
  connection: {
    url: env.TURSO_CONNECTION_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  schema,
  casing: 'snake_case',
});

export default db;
