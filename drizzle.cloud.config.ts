import env from '@/lib/env';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/cloud/schema.ts',
  out: './src/db/cloud/migrations',
  casing: 'snake_case',
  dbCredentials: {
    url: env.TURSO_CONNECTION_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
});
