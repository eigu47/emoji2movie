import { type MovieHint } from '@/server/getMovies';

export default function GameHint({ hint }: { hint: MovieHint }) {
  return (
    <div className="rounded-lg bg-gray-700 p-2 text-center shadow-sm">
      {hint.text}
    </div>
  );
}
