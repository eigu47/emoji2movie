import z from 'zod';

export const gameStateSchema = z.object({
  movies: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
    })
  ),
});

export type GameState = z.infer<typeof gameStateSchema>;
