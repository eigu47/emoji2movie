'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { MovieList } from '@/lib/types';
import { useThrottle } from '@/lib/useThrottle';
import Fuse, { FuseResult } from 'fuse.js';
import { useEffect, useRef, useState } from 'react';

export default function InputForm() {
  const [input, setInput] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const [results, setResults] = useState<FuseResult<MovieList>[]>([]);
  const fuseRef = useRef<Fuse<MovieList>>(null);

  useEffect(() => {
    getFuse()
      .then((f) => (fuseRef.current = f))
      .catch(console.error);
  }, []);

  const throttledSetResults = useThrottle((val: string) => {
    val = val.trim();

    if (val.length > 10 && results.length == 0) return;
    setResults(fuseRef.current?.search(val, { limit: 5 }) ?? []);
  }, 100);

  return (
    <form className="space-y-4">
      <Command className="relative overflow-visible bg-transparent" loop>
        <Input
          placeholder="Enter your guess..."
          autoFocus
          className="w-full border-gray-600 bg-gray-700 text-center text-lg text-white placeholder-gray-400"
          value={input}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setInput(val);
            throttledSetResults(val);
          }}
          onFocus={() => setShowAutocomplete(true)}
          onBlur={() => setShowAutocomplete(false)}
        />
        {showAutocomplete && input.length > 0 && (
          <CommandList className="bg-popover absolute top-full mt-1 h-fit w-full rounded-md">
            {results.length == 0 ? (
              <CommandEmpty className="flex h-10 items-center justify-center p-0">
                {fuseRef.current ? 'No results found' : 'Loading movies...'}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map(({ item: { id, title, year } }) => (
                  <CommandItem key={id}>{`${title} (${year})`}</CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
      <Button className="w-full bg-purple-600 hover:bg-purple-700">
        Submit Guess
      </Button>
    </form>
  );
}

let fusePromise: Promise<Fuse<MovieList>> | null = null;
function getFuse() {
  fusePromise ??= (async () => {
    const [{ default: Fuse }, { MOVIE_LIST }] = await Promise.all([
      import('fuse.js'),
      import('@/constants/movie-list'),
    ]);

    return new Fuse(MOVIE_LIST, {
      keys: ['title', 'year'],
      threshold: 0.2,
      includeScore: false,
      ignoreDiacritics: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
      // sortFn: (a, b) => Number(a.item.voteCount) - Number(b.item.voteCount),
    });
  })().catch((err: unknown) => {
    fusePromise = null;
    throw err;
  });

  return fusePromise;
}
