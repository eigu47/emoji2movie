'use client';

import {
  getAutocompleteMovies,
  type submitGuessAction,
} from '@/app/play/actions';
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
import { type ActionState, type MovieList } from '@/lib/types';
import { useThrottle } from '@/lib/useThrottle';
import type Fuse from 'fuse.js';
import { type FuseResult } from 'fuse.js';
import { startTransition, useEffect, useRef, useState } from 'react';

export default function SubmitForm({
  actionState: [state, action, isPending],
}: {
  actionState: ActionState<typeof submitGuessAction>;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(true);
  const [results, setResults] = useState<FuseResult<MovieList>[]>([]);
  const fuseRef = useRef<Fuse<MovieList>>(null);
  const activeItemRef = useRef<string>(undefined);

  const throttledSetResults = useThrottle((val: string) => {
    val = val.trim();
    if (val.length > 10 && results.length == 0) return;

    const found = fuseRef.current?.search(val, { limit: 5 }) ?? [];
    activeItemRef.current = found[0]?.item.id.toString();
    setResults(found);
  }, 100);

  useEffect(() => {
    if (fuseRef.current != null) return;

    getFuse()
      .then((f) => {
        fuseRef.current = f;
        throttledSetResults(inputRef.current?.value ?? '');
      })
      .catch(console.error);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Command
        value={activeItemRef.current}
        onValueChange={(val) => {
          activeItemRef.current = val;
        }}
        loop
      >
        <Input
          ref={inputRef}
          placeholder="Enter your guess..."
          autoFocus
          className="w-full border-gray-600 bg-gray-700 text-center text-lg text-white placeholder-gray-400"
          value={input}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
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
              {results.length == 0 ? (
                <CommandEmpty className="flex h-10 items-center justify-center p-0">
                  {fuseRef.current ? 'No results found' : 'Loading movies...'}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {results.map(({ item: { id, title, year } }) => (
                    <CommandItem
                      key={id}
                      value={id.toString()}
                      onSelect={() => {
                        setInput(title);
                        setOpen(false);

                        const form = new FormData();
                        form.append('guess', id.toString());
                        startTransition(() => action(form));
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
  );
}

let fusePromise: Promise<Fuse<MovieList>> | null = null;
function getFuse() {
  fusePromise ??= (async () => {
    const [{ default: Fuse }, { error, data: movies }] = await Promise.all([
      import('fuse.js'),
      getAutocompleteMovies(),
    ]);

    if (error != null) throw new Error(error);

    return new Fuse(movies, {
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
