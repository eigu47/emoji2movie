import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Suspense, use } from 'react';

export default function EmojiDisplay({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'rounded-lg bg-gray-700 p-6 text-center text-6xl shadow-sm',
        className
      )}
    >
      {children}
    </p>
  );
}

export function EmojiDisplayPromise({ promise }: { promise: Promise<string> }) {
  return (
    <Suspense
      fallback={<Skeleton className="h-27 rounded-lg bg-gray-700 shadow-sm" />}
    >
      <DisplayPromise promise={promise} />
    </Suspense>
  );
}

function DisplayPromise({ promise }: { promise: Promise<string> }) {
  const text = use(promise);
  return <EmojiDisplay>{text}</EmojiDisplay>;
}
