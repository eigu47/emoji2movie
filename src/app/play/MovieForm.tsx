'use client';

import { type submitGuessAction } from '@/app/play/actions';
import AutocompletePromise from '@/app/play/FormAutocomplete';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { type ActionState } from '@/lib/types';
import { type TopMovie } from '@/server/getMovies';
import type Fuse from 'fuse.js';
import {
  startTransition,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export default function MovieForm({
  actionState: [{ guessed }, action, isPending],
  autocompletePromise,
}: {
  actionState: ActionState<typeof submitGuessAction>;
  autocompletePromise: Promise<TopMovie[]>;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(true);
  const [fuse, setFuse] = useState<Fuse<TopMovie>>();
  const activeItemRef = useRef<string>(undefined);
  const deferredInput = useDeferredValue(input.trim());
  const resultLength = useRef(0);

  const results = useMemo(() => {
    if (!fuse) return [];
    if (deferredInput.length > 10 && resultLength.current == 0) return [];

    const found = fuse.search(deferredInput, { limit: 5 });
    activeItemRef.current = found
      .find(({ item: { id } }) => !guessed.includes(id))
      ?.item.id.toString();
    resultLength.current = found.length;
    return found;
  }, [deferredInput, guessed, fuse]);

  function openAutocomplete() {
    activeItemRef.current = results
      .find(({ item: { id } }) => !guessed.includes(id))
      ?.item.id.toString();
    setOpen(true);
  }

  useEffect(() => {
    if (!isPending) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isPending]);

  return (
    <Command
      value={activeItemRef.current}
      className="bg-transparent"
      onValueChange={(val) => {
        activeItemRef.current = val;
      }}
      loop
    >
      <Input
        ref={inputRef}
        placeholder="Enter your guess..."
        autoFocus
        className="w-full text-center text-lg"
        disabled={isPending}
        value={input}
        onFocus={openAutocomplete}
        onClick={openAutocomplete}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          const val = e.currentTarget.value;
          setInput(val);
          setOpen(true);
        }}
      />
      <Popover open={open && deferredInput.length > 0}>
        <PopoverAnchor />
        <PopoverContent
          asChild
          className="mx-6 w-[calc(512px-48px)] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <CommandList>
            <Suspense
              fallback={
                <CommandEmpty className="absolute top-10 h-10 items-center justify-center p-0">
                  Loading movies...
                </CommandEmpty>
              }
            >
              <CommandGroup>
                <AutocompletePromise
                  guessed={guessed}
                  isPending={isPending}
                  results={results}
                  setFuse={setFuse}
                  autocompletePromise={autocompletePromise}
                  onSelect={(movie) => {
                    setInput(movie.title);
                    setOpen(false);

                    const form = new FormData();
                    form.append('guess', movie.id.toString());
                    startTransition(() => action(form));
                  }}
                />
              </CommandGroup>
            </Suspense>
          </CommandList>
        </PopoverContent>
      </Popover>
    </Command>
  );
}
