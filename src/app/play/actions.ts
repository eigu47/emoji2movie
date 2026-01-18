'use server';

import { getEmoji, getRandomEmoji } from '@/server/getEmoji';
import {
  filterGameState,
  type GameStateFront,
  getOrCreateGameState,
  updateGameState,
} from '@/server/getGameState';
import { getMovieById, getMovieHint } from '@/server/getMovies';
import z from 'zod';

export async function getGameStateAction() {
  const state = await getOrCreateGameState();
  const emoji = await getEmoji(state.movieId).then(({ emoji }) => emoji);
  await updateGameState(state);
  return { ...filterGameState(state), emoji };
}

export type GuessResponse = GameStateFront & {
  emoji?: string;
  answer?: { title: string; year: number; posterPath: string };
};

// Prefetch next round (new movie + emoji) - called in background
export async function startNextRoundAction() {
  const { emoji, id } = await getRandomEmoji();

  await updateGameState({ movieId: id, guessed: [], hint: [] });

  return { emoji };
}

export async function submitGuessAction(
  movieIdGuess: unknown
): Promise<GuessResponse> {
  try {
    const guess = z.coerce.number().parse(movieIdGuess);

    // Read ALL state from cookie (single source of truth)
    const state = await getOrCreateGameState();
    const { movieId, guessed, hint, streak, bestStreak } = state;

    // Correct guess - only fetch poster, don't fetch new movie/emoji yet
    if (movieId === guess) {
      const { title, year, posterPath } = await getMovieById(movieId);

      const newState = {
        streak: streak + 1,
        bestStreak: Math.max(bestStreak, streak + 1),
        guessed: [],
        hint: [],
      };

      // Update streak in cookie, but keep same movieId (will be updated by startNextRoundAction)
      await updateGameState({
        ...newState,
        movieId: null,
      });

      return {
        ...newState,
        answer: { title, year, posterPath },
      };
    }

    // Incorrect guess - still have hints left
    const response = filterGameState(state);
    if (hint.length < 3) {
      const newHint = await getMovieHint(movieId, hint);
      const newState = {
        guessed: [...guessed, guess],
        hint: [...hint, newHint],
      };

      await updateGameState(newState);

      return {
        ...response,
        ...newState,
      };
    }

    // Game over - only fetch poster, don't fetch new movie/emoji yet
    const { title, year, posterPath } = await getMovieById(movieId);

    // Reset streak in cookie
    await updateGameState({ movieId: null, streak: 0 });

    return {
      ...response,
      streak: 0,
      answer: { title, year, posterPath },
    };
  } catch (error) {
    console.error('Failed to submit guess: ', error);

    // Recovery: read current state from cookie and return it
    const state = await getOrCreateGameState();
    const { emoji } = await getEmoji(state.movieId);

    return { ...filterGameState(state), emoji };
  }
}
