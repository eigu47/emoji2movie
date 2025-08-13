import cloudDb from '@/db/cloud';
import { emoji } from '@/db/cloud/schema';
import { getMovie } from '@/server/getMovies';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import z from 'zod';

export async function getEmoji(id: number) {
  try {
    const cachedEmoji = await cloudDb.query.emoji.findFirst({
      columns: {
        id: true,
        emoji: true,
      },
      where: (emoji, { eq }) => eq(emoji.id, id),
    });

    if (cachedEmoji) return cachedEmoji;

    const movie = await getMovie(id);
    if (!movie) throw new Error(`Movie not found in db ${id}`);

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      temperature: 0.3,
      system: `You are a game master creating clues for a movie guessing game. 
Your task is to choose exactly 5 emojis that hint at the movie's plot, characters, setting, or key elements.
Focus on distinctive, memorable aspects that would help someone guess the movie.
Avoid generic emojis that could apply to many movies or repeating the same emoji unless essential.
Output only the 5 emojis with no spaces, no text, and no explanations.`,
      prompt: `Movie: ${movie.title} (${movie.year})`,
    });

    const generatedEmoji = z
      .string()
      .transform((str) =>
        str.replace(/[^(\p{Extended_Pictographic}|\p{Emoji_Component})]/gu, '')
      )
      .parse(text);
    const newEmoji = { id, emoji: generatedEmoji };

    await cloudDb
      .insert(emoji)
      .values(newEmoji)
      .onConflictDoUpdate({ target: emoji.id, set: { emoji: newEmoji.emoji } })
      .run();

    return newEmoji;
  } catch (error: unknown) {
    console.error('Couldnt generate emoji: ', error);
    throw error;
  }
}
