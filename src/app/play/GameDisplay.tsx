import { cn } from '@/lib/utils';

export default function GameDisplay({
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
