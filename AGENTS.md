# AGENTS.md - Development Guidelines for emoji2movie

Guidelines for agentic coding assistants working on this Next.js 15 movie guessing game.

## Tech Stack

- **Next.js 15** with App Router, React 19, Turbopack
- **TypeScript** with strict mode
- **Tailwind CSS 4** + shadcn/ui components
- **Drizzle ORM** with SQLite (local) / Turso (cloud)
- **OpenAI** + Vercel AI SDK for emoji generation

## Commands

### Development

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # Run ESLint (required before commits)
```

### Database

```bash
# Local (SQLite)
npm run db:local:push    # Push schema to local DB
npm run db:local:studio  # Open Drizzle Studio
npm run db:local:seed    # Seed local database

# Cloud (Turso)
npm run db:push          # Push schema to cloud DB
npm run db:studio        # Open Drizzle Studio (port 3001)
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
```

### Testing

No test framework configured. No single-test command available.

## Code Style

### TypeScript Strictness

- `strict: true` with all strict flags enabled
- `noUncheckedIndexedAccess: true` - array access returns `T | undefined`
- `noImplicitReturns: true` - all code paths must return
- Path alias: `@/*` maps to `./src/*`

### Import Style (ESLint enforced)

```typescript
// CORRECT: inline type imports
import { type Dispatch, type SetStateAction } from 'react';
import { clsx, type ClassValue } from 'clsx';

// WRONG: separate type imports
import type { Dispatch } from 'react';
```

### Type Definitions

```typescript
// CORRECT: use 'type' keyword
type GameState = { movieId: number; guessed: string[] };

// WRONG: use 'interface'
interface GameState {
  movieId: number;
  guessed: string[];
}
```

### Formatting (Prettier)

- Single quotes, semicolons required
- 2-space indentation, 80 char line width
- ES5 trailing commas
- Tailwind class sorting via plugin

### Naming Conventions

| Context         | Style             | Example                   |
| --------------- | ----------------- | ------------------------- |
| Database fields | snake_case        | `movie_id`, `created_at`  |
| TypeScript/JS   | camelCase         | `movieId`, `createdAt`    |
| Table names     | plural snake_case | `game_states`, `movies`   |
| Components      | PascalCase        | `GameCard`, `MovieSearch` |

### Console Logging

```typescript
// ALLOWED
console.error('Operation failed:', error);
console.warn('Deprecation warning');

// FORBIDDEN (ESLint error)
console.log('debug info');
```

## Key ESLint Rules

| Rule                                             | Setting                 |
| ------------------------------------------------ | ----------------------- |
| `@typescript-eslint/consistent-type-imports`     | error (inline)          |
| `@typescript-eslint/consistent-type-definitions` | warn (type)             |
| `@typescript-eslint/no-explicit-any`             | warn                    |
| `@typescript-eslint/no-unused-vars`              | warn                    |
| `no-console`                                     | warn (allow error/warn) |

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/ui/ # shadcn/ui components
├── lib/           # Utils, types, constants
│   ├── types.ts   # Shared type definitions
│   ├── utils.ts   # cn() helper, utilities
│   ├── env.ts     # Zod-validated env vars
│   └── validation.ts
├── server/        # Server-side functions
└── db/            # Database configs (local/cloud)
```


## Patterns

### Server Components (default)

```typescript
export default async function Play() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Client Components

```typescript
'use client';
export default function Interactive() {
  const [state, setState] = useState();
  return <button onClick={() => setState(x => x + 1)}>{state}</button>;
}
```

### Error Handling with Zod

```typescript
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1),
  year: z.number().positive(),
});

const result = schema.safeParse(input);
if (!result.success) {
  console.error('Validation failed:', result.error);
  return null;
}
```

### Conditional Classes

```typescript
import { cn } from '@/lib/utils';

<div className={cn('base-class', isActive && 'active-class')} />
```

### React Type Helpers (from lib/types.ts)

```typescript
export type ReactSetState<T> = Dispatch<SetStateAction<T>>;
export type ReactState<T> = [T, ReactSetState<T>];
```

## Commit Messages

Keep under 50 characters, imperative mood, conventional types:

```
feat: add user login
fix: resolve button click bug
refactor: simplify game logic
```

## Before Committing

1. Run `npm run lint` - fix all errors
2. Verify TypeScript compiles without errors
3. Test changes with both local and cloud DB if applicable
4. Follow existing patterns - avoid introducing new conventions

## Environment Variables

Validated via Zod in `src/lib/env.ts`. Required:

- `TURSO_CONNECTION_URL`
- `TURSO_AUTH_TOKEN`
- `OPENAI_API_KEY`

Use `.env.local` for local development.
