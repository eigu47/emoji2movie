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
import { Movie } from '@/lib/getMovieLists';
import { useThrottle } from '@/lib/useThrottle';
import Fuse, { FuseResult } from 'fuse.js';
import { useMemo, useState } from 'react';

export default function InputForm({ movieList }: { movieList: Movie[] }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<FuseResult<Movie>[]>([]);

  const fuse = useMemo(() => {
    return new Fuse(movieList, {
      keys: ['title'],
      threshold: 0.3,
      includeScore: false,
      ignoreDiacritics: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
      // sortFn: (a, b) => Number(a.item.voteCount) - Number(b.item.voteCount),
    });
  }, [movieList]);

  const throttledSetResults = useThrottle((val: string) => {
    if (val.length > 10 && results.length == 0) return;
    setResults(fuse.search(val, { limit: 5 }));
  }, 100);

  return (
    <form className="space-y-4">
      <Command className="relative overflow-visible bg-transparent" loop>
        <Input
          placeholder="Enter your guess..."
          className="w-full border-gray-600 bg-gray-700 text-center text-lg text-white placeholder-gray-400"
          value={input}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setInput(val);
            throttledSetResults(val);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isFocused && input.length > 0 && (
          <CommandList className="bg-popover absolute top-full mt-1 h-fit w-full rounded-md">
            {results.length == 0 ? (
              <CommandEmpty className="flex h-10 items-center justify-center p-0">
                No results found
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
