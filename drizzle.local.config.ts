import env from '@/lib/env';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  casing: 'snake_case',
  dbCredentials: {
    url: env.TURSO_CONNECTION_URL,
  },
});
