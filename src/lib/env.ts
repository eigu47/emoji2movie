import z from 'zod';

const envSchema = z.object({
  TURSO_CONNECTION_URL: z.string().nonempty(),
  TURSO_AUTH_TOKEN: z.string().nonempty(),
  OPENAI_API_KEY: z.string().nonempty(),
});

const env = envSchema.parse(process.env);

export default env;
