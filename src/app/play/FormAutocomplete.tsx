import { CommandEmpty, CommandItem } from '@/components/ui/command';
import { type ReactSetState } from '@/lib/types';
import { type TopMovie } from '@/server/getMovies';
import Fuse, { type FuseResult } from 'fuse.js';
import { use, useEffect } from 'react';

export default function AutocompletePromise({
  guessed,
  isPending,
  results,
  autocompletePromise,
  setFuse,
  onSelect,
}: {
  guessed: number[];
  isPending: boolean;
  results: FuseResult<TopMovie>[];
  autocompletePromise: Promise<TopMovie[]>;
  setFuse: ReactSetState<Fuse<TopMovie> | undefined>;
  onSelect: (movie: TopMovie) => void;
}) {
  const movies = use(autocompletePromise);

  useEffect(() => {
    setFuse(
      new Fuse(movies, {
        keys: ['title', 'year'],
        threshold: 0.2,
        includeScore: false,
        ignoreDiacritics: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
      })
    );
  }, [movies, setFuse]);

  if (results.length == 0)
    return (
      <CommandEmpty className="flex h-10 items-center justify-center p-0">
        No results found
      </CommandEmpty>
    );

  return results.map(({ item }) => (
    <CommandItem
      key={item.id}
      value={item.id.toString()}
      disabled={isPending || guessed.includes(item.id)}
      onSelect={() => onSelect(item)}
    >{`${item.title} (${item.year})`}</CommandItem>
  ));
}
