import { ClientWrapper } from '@/app/play/ClientWrapper';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGameState } from '@/server/gameState';
import SubmitForm from './SubmitForm';

export default async function Play() {
  const gameState = await getGameState();
  const { movieIds } = gameState;
  const totalQuestions = 10;

  return (
    <ClientWrapper gameState={gameState}>
      <div className="mt-[10dvh] flex min-h-dvh flex-col items-center">
        <Card className="w-full max-w-lg border-gray-700 bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-purple-300">
                🎬 Guess the movie!
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-gray-700 px-3 py-1 text-lg text-gray-200"
              >
                {movieIds.length - 1}/{totalQuestions}
              </Badge>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                Question {movieIds.length} of {totalQuestions}
              </span>
              {/* <span>
                {Math.round(((movieIds.length - 1) / totalQuestions) * 100)}%
                Complete
              </span> */}
            </div>
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${((movieIds.length - 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="rounded-lg bg-gray-700 p-6 text-center text-6xl shadow-sm">
              🌸
            </p>
            <SubmitForm />
          </CardContent>
        </Card>
      </div>
    </ClientWrapper>
  );
}
