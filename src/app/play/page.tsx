import GameCard from '@/app/play/GameCard';
import { Skeleton } from '@/components/ui/skeleton';
import { getGameState } from '@/server/gameState';
import { getEmoji } from '@/server/getEmoji';
import { Suspense } from 'react';

export default async function Play() {
  const gameState = await getGameState();

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
            <EmojiLoader movieId={gameState.movieIds.at(-1)!} />
          </Suspense>
        }
      />
    </div>
  );
}

export function EmojiDisplay({ emoji }: { emoji: string }) {
  return (
    <p className="rounded-lg bg-gray-700 p-6 text-center text-6xl shadow-sm">
      {emoji}
    </p>
  );
}

export async function EmojiLoader({ movieId }: { movieId: number }) {
  const emoji = await getEmoji(movieId);

  return <EmojiDisplay emoji={emoji.emoji} />;
}
