import z from 'zod';

export const gameStateSchema = z.object({
  movieIds: z.array(z.number()),
});

export type GameState = z.infer<typeof gameStateSchema>;
