import GameCard from '@/app/play/GameCard';
import { getEmoji } from '@/server/getEmoji';
import { getOrCreateGameState } from '@/server/getGameState';

export default async function Play() {
  const gameState = await getOrCreateGameState();
  const emojiPromise = getEmoji(gameState.movieId).then(({ emoji }) => emoji);

  return (
    <div className="mt-[10dvh] flex min-h-dvh flex-col items-center">
      <GameCard gameState={gameState} emojiPromise={emojiPromise} />
    </div>
  );
}
