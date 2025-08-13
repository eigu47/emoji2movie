import PlayCard from '@/app/play/PlayCard';
import localDb from '@/db/local';
import { getGameState } from '@/server/gameState';

export default async function Play() {
  const gameState = await getGameState();
  const movie = await localDb.query.movie.findFirst({
    columns: {
      title: true,
    },
    where: (movie, { eq }) => eq(movie.id, gameState.movieIds.at(-1)!),
  });

  return (
    <div className="mt-[10dvh] flex min-h-dvh flex-col items-center">
      <PlayCard gameState={gameState} />
    </div>
  );
}
