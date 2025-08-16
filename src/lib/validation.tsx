import z from 'zod';

export const gameStateSchema = z.object({
  session: z.uuid(),
  movieId: z.number().int(),
  streak: z.number().int(),
  bestStreak: z.number().int(),
});

export type GameState = z.infer<typeof gameStateSchema>;
