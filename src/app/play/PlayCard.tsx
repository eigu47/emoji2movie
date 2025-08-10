'use client';

import { setGameAction, submitGuessAction } from '@/app/play/actions';
import SubmitForm from '@/app/play/SubmitForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getLocalCookie } from '@/lib/localCookies';
import { gameStateSchema, type GameState } from '@/lib/schemas';
import { successResponse } from '@/server/serverResponse';
import { useActionState, useEffect } from 'react';

export default function PlayCard({ gameState }: { gameState: GameState }) {
  const actionState = useActionState(
    submitGuessAction,
    successResponse({ guess: '' })
  );

  const { movieIds } = gameState;
  const totalQuestions = 10;

  useEffect(() => {
    try {
      const gameCookie = getLocalCookie('game');
      gameStateSchema.parse(JSON.parse(gameCookie ?? '{}'));
      if (JSON.stringify(gameState) !== gameCookie) throw new Error();
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
            {movieIds.length - 1}/{totalQuestions}
          </Badge>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>
            Question {movieIds.length} of {totalQuestions}
          </span>
          {/* <span>
          {Math.round(((movieIds.length - 1) / totalQuestions) * 100)}%
          Complete
        </span> */}
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <div
            className="h-2 rounded-full bg-purple-600 transition-all duration-300"
            style={{
              width: `${((movieIds.length - 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="rounded-lg bg-gray-700 p-6 text-center text-6xl shadow-sm">
          🌸
        </p>
        <SubmitForm actionState={actionState} />
      </CardContent>
    </Card>
  );
}
