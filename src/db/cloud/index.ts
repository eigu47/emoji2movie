import env from '@/lib/env';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '@/db/cloud/schema';

const client = createClient({
  url: env.TURSO_CONNECTION_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

const cloudDb = drizzle(client, {
  schema,
  casing: 'snake_case',
});

export default cloudDb;
