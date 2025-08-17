'use client';

import { submitGuessAction } from '@/app/play/actions';
import EmojiDisplay, { EmojiDisplayPromise } from '@/app/play/EmojiDisplay';
import Hint from '@/app/play/Hint';
import MovieForm from '@/app/play/MovieForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMG_BASE_URL } from '@/lib/constants';
import { useSyncGameState } from '@/lib/useSyncGameState';
import { type GameState } from '@/lib/validation';
import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';

export default function GameCard({
  gameState,
  emojiPromise,
}: {
  gameState: GameState;
  emojiPromise: Promise<string>;
}) {
  useSyncGameState(gameState);
  const actionState = useActionState(submitGuessAction, gameState);
  const [{ emoji, guessed, hint, answer, streak }, action, isPending] =
    actionState;

  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    if (answer?.posterPath) setShowPoster(true);
  }, [answer?.posterPath]);

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
            {streak - 1}/{totalQuestions}
          </Badge>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>
            Question {streak} of {totalQuestions}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <div
            className="h-2 rounded-full bg-purple-600 transition-all duration-300"
            style={{
              width: `${((streak - 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!emoji ? (
          // Initial emoji
          <EmojiDisplayPromise promise={emojiPromise} />
        ) : showPoster && answer ? (
          // Poster
          <EmojiDisplay className="p-2">
            <Image
              src={IMG_BASE_URL + answer.posterPath}
              alt={`${answer.title} (${answer.year}) movie Poster`}
              className="mx-auto rounded-lg object-cover"
              width={200}
              height={300}
            />
          </EmojiDisplay>
        ) : (
          // Emoji from response
          <EmojiDisplay>{emoji}</EmojiDisplay>
        )}

        <div className="space-y-2">
          {hint.map((hint, i) => (
            <Hint key={`${hint.text}${i}`} hint={hint} />
          ))}
        </div>

        {showPoster && answer ? (
          <Button className="w-full" onClick={() => setShowPoster(false)}>
            Next
          </Button>
        ) : (
          <MovieForm actionState={actionState} />
        )}
      </CardContent>
    </Card>
  );
}
