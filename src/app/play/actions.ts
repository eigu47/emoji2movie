'use server';

import { type GameState } from '@/lib/validation';
import { getEmoji, getRandomEmoji } from '@/server/getEmoji';
import { getGameState, updateGameState } from '@/server/getGameState';
import { getMovieById, getMovieHint, getTopMovies } from '@/server/getMovies';
import { errorResponse, successResponse } from '@/server/serverResponse';
import z from 'zod';

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

export type NextRoundResponse = {
  emoji: string;
  guessed: number[];
  hint: GameState['hint'];
};

// Prefetch next round (new movie + emoji) - called in background
export async function startNextRoundAction(): Promise<NextRoundResponse> {
  const { emoji, id } = await getRandomEmoji();

  await updateGameState({ movieId: id, guessed: [], hint: [] });

  return { emoji, guessed: [], hint: [] };
}

export async function submitGuessAction(
  _prevState: GuessResponse,
  form: FormData
): Promise<GuessResponse> {
  try {
    const { guess } = z
      .object({ guess: z.coerce.number() })
      .parse(Object.fromEntries(form));

    // Read ALL state from cookie (single source of truth)
    const { movieId, guessed, hint, streak, bestStreak } = await getGameState();

    // Correct guess - only fetch poster, don't fetch new movie/emoji yet
    if (movieId === guess) {
      const { title, year, posterPath } = await getMovieById(movieId);

      const newStreak = streak + 1;
      const newBestStreak = Math.max(bestStreak, newStreak);

      // Update streak in cookie, but keep same movieId (will be updated by startNextRoundAction)
      await updateGameState({
        streak: newStreak,
        bestStreak: newBestStreak,
      });

      return {
        guessed,
        hint,
        streak: newStreak,
        bestStreak: newBestStreak,
        answer: { title, year, posterPath },
      };
    }

    // Incorrect guess - still have hints left
    if (hint.length < 3) {
      const newHint = await getMovieHint(movieId, hint);
      const newState = {
        guessed: [...guessed, guess],
        hint: [...hint, newHint],
        streak,
        bestStreak,
      };

      await updateGameState(newState);

      return newState;
    }

    // Game over - only fetch poster, don't fetch new movie/emoji yet
    const { title, year, posterPath } = await getMovieById(movieId);

    // Reset streak in cookie
    await updateGameState({ streak: 0 });

    return {
      guessed,
      hint,
      streak: 0,
      bestStreak,
      answer: { title, year, posterPath },
    };
  } catch (error) {
    console.error('Failed to submit guess: ', error);

    // Recovery: read current state from cookie and return it
    const { guessed, hint, streak, bestStreak, movieId } = await getGameState();
    const { emoji } = await getEmoji(movieId);

    return { guessed, hint, streak, bestStreak, emoji };
  }
}
