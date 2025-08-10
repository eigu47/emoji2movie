'use client';

import { setGameAction } from '@/app/play/actions';
import { getLocalCookie } from '@/lib/localCookies';
import { GameState, gameStateSchema } from '@/lib/schemas';
import { useEffect } from 'react';

export function ClientWrapper({ gameState }: { gameState: GameState }) {
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

  return null;
}
