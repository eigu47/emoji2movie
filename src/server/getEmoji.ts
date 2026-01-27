import cloudDb from '@/db/cloud';
import { emoji } from '@/db/cloud/schema';
import { getMovieById, getRandomMovie } from '@/server/getMovies';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { sql } from 'drizzle-orm';
import z from 'zod';

const getEmojiByIdPrepared = cloudDb.query.emoji
  .findFirst({
    columns: {
      id: true,
      emoji: true,
    },
    where: ({ id }, { eq }) => eq(id, sql.placeholder('id')),
  })
  .prepare();

const MAX_RETRIES = 5;

export async function getEmoji(id: number) {
  const cachedEmoji = await getEmojiByIdPrepared.execute({ id });
  if (cachedEmoji) return cachedEmoji;

  let parsedEmoji;
  let lastErr;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const { title, year } = await getMovieById(id);
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        temperature: 0.3,
        system: `You are a game master creating clues for a movie guessing game. 
    Your task is to choose exactly 5 emojis that hint at the movie's plot, characters, setting, or key elements.
    Focus on distinctive, memorable aspects that would help someone guess the movie.
    Avoid generic emojis that could apply to many movies or repeating the same emoji unless essential.
    Output only the 5 emojis with no spaces, no text, and no explanations.`,
        prompt: `Movie: ${title} (${String(year)})`,
      });

      parsedEmoji = z
        .string()
        .transform((str) =>
          str.replace(
            /[^(\p{Extended_Pictographic}|\p{Emoji_Component})]/gu,
            ''
          )
        )
        .refine((str) => {
          const segmenter = new Intl.Segmenter('en', {
            granularity: 'grapheme',
          });
          return Array.from(segmenter.segment(str)).length === 5;
        })
        .parse(text);
      break;
    } catch (err) {
      console.error('Couldnt generate emoji: ', err);
      lastErr = err;
    }
  }

  if (!parsedEmoji) {
    throw new Error(
      `Max retries reached for movie ID ${String(id)}: ${String(lastErr)}`
    );
  }

  const newEmoji = { id, emoji: parsedEmoji };
  await cloudDb
    .insert(emoji)
    .values(newEmoji)
    .onConflictDoUpdate({
      target: emoji.id,
      set: { emoji: newEmoji.emoji },
    })
    .run();

  return newEmoji;
}

export async function getRandomEmoji() {
  const movie = await getRandomMovie();
  const emoji = await getEmoji(movie.id);
  return { ...movie, ...emoji };
}
