import { HINT_TYPE } from '@/lib/constants';
import z from 'zod';

export const gameStateSchema = z.object({
  session: z.uuid(),
  movieId: z.number().int(),
  guessed: z.array(z.number().int()),
  hint: z.array(
    z.object({
      type: z.enum(HINT_TYPE),
      text: z.string(),
    })
  ),
  streak: z.number().int(),
  bestStreak: z.number().int(),
});

export type GameState = z.infer<typeof gameStateSchema>;
