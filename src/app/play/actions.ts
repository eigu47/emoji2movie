'use server';

import { GameState, gameStateSchema } from '@/lib/schemas';
import { errorResponse, successResponse } from '@/server/serverResponse';
import { cookies } from 'next/headers';

export async function setGameAction(gameState: GameState) {
  try {
    const parsedGameState = gameStateSchema.parse(gameState);
    const cookieStore = await cookies();
    cookieStore.set('game', JSON.stringify(parsedGameState));
    return successResponse(parsedGameState);
  } catch (error) {
    return errorResponse('Failed to set game state', error);
  }
}
