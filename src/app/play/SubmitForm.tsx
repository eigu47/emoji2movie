'use client';

import { submitGuessAction } from '@/app/play/actions';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MovieList } from '@/lib/types';
import { useThrottle } from '@/lib/useThrottle';
import { successResponse } from '@/server/serverResponse';
import Fuse, { FuseResult } from 'fuse.js';
import { useActionState, useEffect, useRef, useState } from 'react';

export default function InputForm() {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(true);
  const fuseRef = useRef<Fuse<MovieList>>(null);
  const resultsRef = useRef<FuseResult<MovieList>[]>([]);
  const activeItemRef = useRef<string>(undefined);

  const [state, action, isPending] = useActionState(
    submitGuessAction,
    successResponse({ guess: '' })
  );

  const throttledSetResults = useThrottle((val: string) => {
    val = val.trim();
    if (val.length > 10 && resultsRef.current.length == 0) return;

    const results = fuseRef.current?.search(val, { limit: 5 }) ?? [];
    resultsRef.current = results;
    activeItemRef.current = results[0]?.item.id.toString();
  }, 100);

  useEffect(() => {
    getFuse()
      .then((f) => {
        fuseRef.current = f;
        throttledSetResults(input);
      })
      .catch(console.error);
  }, []);

  return (
    <form className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <Command
          value={activeItemRef.current}
          onValueChange={(val) => {
            activeItemRef.current = val;
          }}
          loop
        >
          <Input
            placeholder="Enter your guess..."
            autoFocus
            className="w-full border-gray-600 bg-gray-700 text-center text-lg text-white placeholder-gray-400"
            value={input}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setInput(val);
              setOpen(true);
              throttledSetResults(val);
            }}
          />
          <PopoverTrigger />
          <PopoverContent
            asChild
            className="mx-6 w-[calc(512px-48px)] p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {input.length > 0 && (
              <CommandList>
                {resultsRef.current.length == 0 ? (
                  <CommandEmpty className="flex h-10 items-center justify-center p-0">
                    {fuseRef.current ? 'No results found' : 'Loading movies...'}
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {resultsRef.current.map(({ item: { id, title, year } }) => (
                      <CommandItem
                        key={id}
                        value={id.toString()}
                        onSelect={() => {
                          setInput(title);
                          setOpen(false);
                        }}
                      >{`${title} (${year})`}</CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            )}
          </PopoverContent>
        </Command>
      </Popover>
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
    });
  })().catch((err: unknown) => {
    fusePromise = null;
    throw err;
  });

  return fusePromise;
}
