'use client';

import { setGameAction } from '@/app/play/actions';
import { getLocalCookie } from '@/lib/localCookies';
import { GameState, gameStateSchema } from '@/lib/schemas';
import { ReactNode, useEffect } from 'react';

export function ClientWrapper({
  children,
  gameState,
}: {
  children: ReactNode;
  gameState: GameState;
}) {
  useEffect(() => {
    try {
      const gameCookie = getLocalCookie('game');
      gameStateSchema.parse(JSON.parse(gameCookie ?? '{}'));
      if (JSON.stringify(gameState) !== gameCookie) throw new Error();
    } catch {
      void setGameAction(gameState).then((res) => {
        if (!res.ok) {
          alert(res.message);
        }
      });
    }
  }, []);

  return <>{children}</>;
}
