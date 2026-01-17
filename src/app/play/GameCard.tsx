'use client';

import {
  type NextRoundResponse,
  startNextRoundAction,
  submitGuessAction,
} from '@/app/play/actions';
import EmojiDisplay, { EmojiDisplayPromise } from '@/app/play/EmojiDisplay';
import Hint from '@/app/play/Hint';
import MovieForm from '@/app/play/MovieForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IMG_BASE_URL } from '@/lib/constants';
import { type GameState } from '@/lib/validation';
import { type TopMovie } from '@/server/getMovies';
import Image from 'next/image';
import {
  Suspense,
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

export default function GameCard({
  gameState,
  emojiPromise,
  autocompletePromise,
}: {
  gameState: GameState;
  emojiPromise: Promise<string>;
  autocompletePromise: Promise<TopMovie[]>;
}) {
  const actionState = useActionState(submitGuessAction, gameState);
  const [state] = actionState;

  const [showPoster, setShowPoster] = useState(false);
  const [nextRound, setNextRound] = useState<NextRoundResponse | null>(null);
  const [activeRound, setActiveRound] = useState<NextRoundResponse | null>(
    null
  );
  const [isLoadingNext, startTransition] = useTransition();
  const prefetchStarted = useRef(false);

  // Derive display values: use activeRound (prefetched) if set, otherwise action state
  const displayEmoji = activeRound?.emoji ?? state.emoji;
  const displayHint = activeRound?.hint ?? state.hint;
  const displayAnswer = activeRound ? undefined : state.answer;
  const { streak, bestStreak } = state;

  // Start prefetching next round when answer is shown
  useEffect(() => {
    if (state.answer?.posterPath && !prefetchStarted.current) {
      prefetchStarted.current = true;
      setShowPoster(true);
      setActiveRound(null); // Clear any previous active round

      // Prefetch next round in background
      startTransition(async () => {
        const result = await startNextRoundAction();
        setNextRound(result);
      });
    }
  }, [state.answer?.posterPath]);

  // Reset prefetch flag when action state changes (new guess submitted)
  useEffect(() => {
    if (!state.answer) {
      prefetchStarted.current = false;
    }
  }, [state.answer]);

  const handleNextClick = () => {
    if (nextRound) {
      // Apply prefetched state to display
      setActiveRound(nextRound);
      setNextRound(null);
      setShowPoster(false);
    }
  };

  // Clear activeRound when a new guess is submitted (action state updates)
  useEffect(() => {
    if (state.emoji && !state.answer) {
      setActiveRound(null);
    }
  }, [state.emoji, state.answer]);

  const totalQuestions = 10;

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
            {streak}/{totalQuestions}
          </Badge>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Best streak: {bestStreak}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <div
            className="h-2 rounded-full bg-purple-600 transition-all duration-300"
            style={{
              width: `${(streak / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!displayEmoji ? (
          // Initial emoji from server
          <Suspense
            fallback={
              <Skeleton className="h-27 rounded-lg bg-gray-700 shadow-sm" />
            }
          >
            <EmojiDisplayPromise promise={emojiPromise} />
          </Suspense>
        ) : showPoster && displayAnswer ? (
          // Poster for correct/game-over
          <EmojiDisplay className="p-2">
            <Image
              src={IMG_BASE_URL + displayAnswer.posterPath}
              alt={`${displayAnswer.title} (${String(displayAnswer.year)}) movie Poster`}
              className="mx-auto rounded-lg object-cover"
              width={200}
              height={300}
            />
          </EmojiDisplay>
        ) : (
          // Emoji from action response
          <EmojiDisplay>{displayEmoji}</EmojiDisplay>
        )}

        <div className="space-y-2">
          {displayHint.map((h, i) => (
            <Hint key={`${h.text}${String(i)}`} hint={h} />
          ))}
        </div>

        {showPoster && displayAnswer ? (
          <Button
            className="w-full"
            onClick={handleNextClick}
            disabled={isLoadingNext && !nextRound}
          >
            {isLoadingNext && !nextRound ? 'Loading...' : 'Next'}
          </Button>
        ) : (
          <MovieForm
            actionState={actionState}
            autocompletePromise={autocompletePromise}
          />
        )}
      </CardContent>
    </Card>
  );
}
