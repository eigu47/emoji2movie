'use client';

import {
  getGameStateAction,
  getNewMovieAction,
  type GuessResponse,
  submitGuessAction,
} from '@/app/play/actions';
import EmojiDisplay, { EmojiDisplayPromise } from '@/app/play/EmojiDisplay';
import Hint from '@/app/play/Hint';
import MovieForm from '@/app/play/MovieForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IMG_BASE_URL, TOTAL_QUESTIONS } from '@/lib/constants';
import { useLoading } from '@/lib/useIsLoading';
import { type TopMovie } from '@/server/getMovies';
import Image from 'next/image';
import { Suspense, useEffect, useState, useTransition } from 'react';

export default function GameCard({
  gameState: initialGameState,
  emojiPromise,
  autocompletePromise,
}: {
  gameState: GuessResponse | null;
  emojiPromise: Promise<string> | null;
  autocompletePromise: Promise<TopMovie[]>;
}) {
  const [gameState, setGameState] = useState(
    initialGameState ?? { guessed: [], hint: [], streak: 0, bestStreak: 0 }
  );
  const [showPoster, setShowPoster] = useState(false);
  const [isLoadingNext, startTransitionNext] = useTransition();
  const [isLoadingGuess, loadGuess] = useLoading();

  const { hint, streak, bestStreak, answer, emoji } = gameState;

  useEffect(() => {
    if (!initialGameState) {
      void (async () => {
        const state = await getGameStateAction();
        setGameState(state);
      })();
    }
  }, [initialGameState]);

  async function handleGuess(movieId: number) {
    const state = await loadGuess(() => submitGuessAction(movieId));
    setGameState(state);

    // Start prefetching next round when answer is shown
    if (state.answer?.posterPath) {
      setShowPoster(true);

      startTransitionNext(async () => {
        const { emoji } = await getNewMovieAction();
        setGameState((prev) => ({
          ...prev,
          guessed: [],
          hint: [],
          emoji,
        }));
      });
    }
  }

  function handleNextRound() {
    setShowPoster(false);
  }

  return (
    <Card className="w-full max-w-lg border-gray-700 bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-purple-300">
            🎬 Guess the movie!
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-gray-700 px-3 py-1 text-lg text-gray-200"
          >
            {streak}/{TOTAL_QUESTIONS}
          </Badge>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Best streak: {bestStreak}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <div
            className="h-2 rounded-full bg-purple-600 transition-all duration-300"
            style={{
              width: `${String((streak / TOTAL_QUESTIONS) * 100)}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showPoster && answer ? (
          // Poster for correct/game-over
          <>
            <EmojiDisplay className="p-2">
              <Image
                src={IMG_BASE_URL + answer.posterPath}
                alt={`${answer.title} (${String(answer.year)}) movie Poster`}
                className="mx-auto rounded-lg object-cover"
                width={200}
                height={300}
                unoptimized
              />
            </EmojiDisplay>
            <Button autoFocus className="w-full" onClick={handleNextRound}>
              Next
            </Button>
          </>
        ) : (
          // Show form
          <>
            {isLoadingNext ? (
              // Loading...
              <Skeleton className="h-27 rounded-lg bg-gray-700 shadow-sm" />
            ) : !emoji && emojiPromise ? (
              // Initial emoji from server
              <Suspense
                fallback={
                  <Skeleton className="h-27 rounded-lg bg-gray-700 shadow-sm" />
                }
              >
                <EmojiDisplayPromise promise={emojiPromise} />
              </Suspense>
            ) : (
              <EmojiDisplay>{emoji}</EmojiDisplay>
            )}

            <div className="space-y-2">
              {hint.map((h, i) => (
                <Hint key={`${h.text}${String(i)}`} hint={h} />
              ))}
            </div>

            <MovieForm
              gameState={gameState}
              isLoadingGuess={isLoadingGuess}
              handleGuess={handleGuess}
              autocompletePromise={autocompletePromise}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
