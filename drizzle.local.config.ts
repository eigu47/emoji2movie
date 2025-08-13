import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/local/schema.ts',
  out: './src/db/local/migrations',
  casing: 'snake_case',
  dbCredentials: {
    url: 'local-db.db',
  },
});
