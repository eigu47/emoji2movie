import env from '@/lib/env';
import { drizzle } from 'drizzle-orm/libsql';

const db = drizzle({
  connection: {
    url: env.TURSO_CONNECTION_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  casing: 'snake_case',
});

export default db;
