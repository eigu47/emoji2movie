import GameCard from '@/app/play/GameCard';
import { getEmoji } from '@/server/getEmoji';
import { filterGameState, getGameState } from '@/server/getGameState';
import { getTopMovies } from '@/server/getMovies';

export default async function Play() {
  const gameState = await getGameState();
  const emojiPromise = gameState?.movieId
    ? getEmoji(gameState.movieId).then(({ emoji }) => emoji)
    : null;
  const autocompletePromise = getTopMovies(5000);

  return (
    <div className="mt-[10dvh] flex min-h-dvh flex-col items-center">
      <GameCard
        gameState={gameState?.movieId ? filterGameState(gameState) : null}
        emojiPromise={emojiPromise}
        autocompletePromise={autocompletePromise}
      />
    </div>
  );
}
