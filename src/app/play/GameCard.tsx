'use client';

import { setGameAction, submitGuessAction } from '@/app/play/actions';
import GameDisplay from '@/app/play/GameDisplay';
import GameForm from '@/app/play/GameForm';
import GameHint from '@/app/play/GameHint';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IMG_BASE_URL } from '@/lib/constants';
import { getLocalCookie } from '@/lib/localCookies';
import { deepEqual } from '@/lib/utils';
import { gameStateSchema, type GameState } from '@/lib/validation';
import { successResponse } from '@/server/serverResponse';
import Image from 'next/image';
import { useActionState, useEffect, useState } from 'react';

export default function GameCard({
  gameState,
  emojiDisplay,
}: {
  gameState: GameState;
  emojiDisplay: React.ReactNode;
}) {
  const actionState = useActionState(
    submitGuessAction,
    successResponse(gameState)
  );
  const [
    {
      data: { emoji, guessed, hint, answer },
    },
    action,
    isPending,
  ] = actionState;
  const showPosterState = useState(false);
  const [showPoster, setShowPoster] = showPosterState;

  useEffect(() => {
    if (answer?.posterPath) setShowPoster(true);
  }, [answer?.posterPath]);

  const totalQuestions = 10;

  useEffect(() => {
    try {
      const gameCookie = getLocalCookie('game');
      const parsedGameCookie = gameStateSchema.parse(
        JSON.parse(gameCookie ?? '{}')
      );
      if (!deepEqual(gameState, parsedGameCookie))
        throw new Error('Game state mismatch');
    } catch {
      void setGameAction(gameState).then((res) => {
        if (res.error) {
          alert(res.error);
        }
      });
    }
  }, []);

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
            {gameState.streak - 1}/{totalQuestions}
          </Badge>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>
            Question {gameState.streak} of {totalQuestions}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <div
            className="h-2 rounded-full bg-purple-600 transition-all duration-300"
            style={{
              width: `${((gameState.streak - 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!emoji ? (
          emojiDisplay
        ) : showPoster && answer ? (
          <GameDisplay className="p-2">
            <Image
              src={IMG_BASE_URL + answer.posterPath}
              alt={`${answer.title} (${answer.year}) movie Poster`}
              className="mx-auto rounded-lg object-cover"
              width={200}
              height={300}
            />
          </GameDisplay>
        ) : (
          <GameDisplay>{emoji}</GameDisplay>
        )}

        <div className="space-y-2">
          {hint.map((hint, i) => (
            <GameHint key={`${hint.text}${i}`} hint={hint} />
          ))}
        </div>

        {showPoster && answer ? (
          <Button className="w-full" onClick={() => setShowPoster(false)}>
            Next
          </Button>
        ) : (
          <GameForm actionState={actionState} />
        )}
      </CardContent>
    </Card>
  );
}
