import PlayCard from '@/app/play/PlayCard';
import { getGameState } from '@/server/gameState';
import { getEmoji } from '@/server/getEmoji';

export default async function Play() {
  const gameState = await getGameState();
  const emoji = await getEmoji(gameState.movieIds.at(-1)!);

  console.log(emoji);

  return (
    <div className="mt-[10dvh] flex min-h-dvh flex-col items-center">
      <PlayCard gameState={gameState} />
    </div>
  );
}
