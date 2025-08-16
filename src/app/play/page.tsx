import GameDisplay from '@/app/play/GameDisplay';
import GameCard from '@/app/play/GameCard';
import { Skeleton } from '@/components/ui/skeleton';
import { getEmoji } from '@/server/getEmoji';
import { getOrCreateGameState } from '@/server/getGameState';
import { Suspense } from 'react';

export default async function Play() {
  const gameState = await getOrCreateGameState();

  return (
    <div className="mt-[10dvh] flex min-h-dvh flex-col items-center">
      <GameCard
        gameState={gameState}
        emojiDisplay={
          <Suspense
            fallback={
              <Skeleton className="h-27 rounded-lg bg-gray-700 shadow-sm" />
            }
          >
            <EmojiLoader movieId={gameState.movieId} />
          </Suspense>
        }
      />
    </div>
  );
}

export async function EmojiLoader({ movieId }: { movieId: number }) {
  const { emoji } = await getEmoji(movieId);

  return <GameDisplay>{emoji}</GameDisplay>;
}
