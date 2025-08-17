import { setGameAction } from '@/app/play/actions';
import { getLocalCookie } from '@/lib/localCookies';
import { deepEqual } from '@/lib/utils';
import { type GameState, gameStateSchema } from '@/lib/validation';
import { useEffect } from 'react';

export function useSyncGameState(gameState: GameState) {
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
  }, [gameState]);

  return null;
}
