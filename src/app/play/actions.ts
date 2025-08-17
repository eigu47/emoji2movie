'use server';

import { type GameState, gameStateSchema } from '@/lib/validation';
import { getEmoji, getRandomEmoji } from '@/server/getEmoji';
import {
  getGameState,
  getOrCreateGameState,
  updateGameState,
} from '@/server/getGameState';
import { getMovieById, getMovieHint, getTopMovies } from '@/server/getMovies';
import { errorResponse, successResponse } from '@/server/serverResponse';
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

export type GuessResponse = Omit<GameState, 'session' | 'movieId'> & {
  emoji?: string;
  answer?: { title: string; year: number; posterPath: string };
};

export async function submitGuessAction(
  data: GuessResponse,
  form: FormData
): Promise<GuessResponse> {
  try {
    const { guess } = z
      .object({ guess: z.coerce.number() })
      .parse(Object.fromEntries(form));

    const { movieId, streak, bestStreak } = await getGameState();

    // Correct guess
    if (movieId == guess) {
      const [{ title, year, posterPath }, { emoji, id }] = await Promise.all([
        getMovieById(movieId),
        getRandomEmoji(),
      ]);

      const newState = {
        emoji,
        guessed: [],
        hint: [],
        streak: streak + 1,
        bestStreak: Math.max(bestStreak, streak + 1),
        answer: {
          title,
          year,
          posterPath,
        },
      };

      await updateGameState({ ...newState, movieId: id });
      return newState;
    }

    // Incorrect guess
    if (data.hint.length < 3) {
      const hint = await getMovieHint(movieId, data.hint);

      return {
        ...data,
        guessed: [...data.guessed, guess],
        hint: [...data.hint, hint],
      };
    }

    // Game over
    const [{ title, year, posterPath }, { emoji, id }] = await Promise.all([
      getMovieById(movieId),
      getRandomEmoji(),
    ]);

    const newState = {
      emoji,
      guessed: [],
      hint: [],
      streak: 0,
      bestStreak,
      answer: {
        title,
        year,
        posterPath,
      },
    };

    await updateGameState({ ...newState, movieId: id });
    return newState;
  } catch (error) {
    console.error('Failed to submit guess: ', error);

    const state = await getOrCreateGameState();
    const { emoji } = await getEmoji(state.movieId);
    return { ...state, emoji };
  }
}
