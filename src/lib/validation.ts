import { HINT_TYPE } from '@/lib/constants';
import z from 'zod';

export const hintSchema = z.object({
  type: z.enum(HINT_TYPE),
  text: z.string().max(500),
});

export type Hint = z.infer<typeof hintSchema>;

export const gameStateSchema = z.object({
  session: z.uuid(),
  movieId: z.number().int().positive(),
  guessed: z.array(z.number().int().positive()).max(10),
  hint: z.array(hintSchema).max(3),
  streak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
});

export type GameState = z.infer<typeof gameStateSchema>;
