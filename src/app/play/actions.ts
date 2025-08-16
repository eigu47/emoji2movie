'use server';

import { type GameState, gameStateSchema } from '@/lib/validation';
import { getRandomEmoji } from '@/server/getEmoji';
import { getGameState, updateGameState } from '@/server/getGameState';
import { getMovieById, getTopMovies } from '@/server/getMovies';
import {
  errorResponse,
  type SuccessResponse,
  successResponse,
} from '@/server/serverResponse';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import z from 'zod';

export async function setGameAction(gameState: GameState) {
  try {
    const parsedGameState = gameStateSchema.parse(gameState);
    const cookieStore = await cookies();
    cookieStore.set('game', JSON.stringify(parsedGameState));
    return successResponse(parsedGameState);
  } catch {
    revalidatePath('/play');
    return errorResponse('Failed to set game state');
  }
}

export async function getAutocompleteMovies() {
  try {
    return successResponse(await getTopMovies(5000));
  } catch (error: unknown) {
    return errorResponse('Failed to load movies', error);
  }
}

export type GuessResponse = {
  guessed: number[];
  hint: number[];
  emoji?: string;
  answer?: {
    title: string;
    year: number;
    posterPath: string;
  };
};

export async function submitGuessAction(
  { data }: SuccessResponse<GuessResponse>,
  form: FormData
): Promise<SuccessResponse<GuessResponse>> {
  try {
    const { guess } = z
      .object({ guess: z.coerce.number() })
      .parse(Object.fromEntries(form));

    const { movieId } = await getGameState();

    // Correct guess
    if (movieId == guess) {
      const [{ title, year, posterPath }, { emoji, id }] = await Promise.all([
        getMovieById(guess),
        getRandomEmoji(),
      ]);
      await updateGameState({ movieId: id, correct: true });

      return successResponse({
        emoji,
        guessed: [],
        hint: [],
        answer: {
          title,
          year,
          posterPath,
        },
      });
    }

    // Incorrect guess
    return successResponse({
      ...data,
      guessed: [...data.guessed, guess],
    });
  } catch (error) {
    console.error('Failed to submit guess: ', error);

    const { emoji, id } = await getRandomEmoji();
    await updateGameState({ movieId: id, correct: false });

    return successResponse({
      emoji,
      guessed: [],
      hint: [],
    });
  }
}
