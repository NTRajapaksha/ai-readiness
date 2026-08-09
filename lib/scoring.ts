import { AssessmentResponse, Dimension, DimensionScores } from '@/types';
import { DIMENSIONS, QUESTIONS } from './questions';

export function normalizeLikert(value: number): number {
  // Value 1 -> 0%, Value 5 -> 100%
  return Math.round(((value - 1) / 4) * 100);
}

export function normalizeMC(optionIndex: number, optionCount: number): number {
  if (optionCount <= 1) return 0;
  return Math.round((optionIndex / (optionCount - 1)) * 100);
}

export function calculateDimensionScores(responses: AssessmentResponse[]): DimensionScores {
  const result: DimensionScores = {
    fluency: 0,
    integration: 0,
    culture: 0,
    risk: 0,
  };

  if (!responses || responses.length === 0) return result;

  for (const dim of DIMENSIONS) {
    const dimQuestions = QUESTIONS.filter((q) => q.dimension === dim && q.type !== 'text_optional');
    const questionIds = new Set(dimQuestions.map((q) => q.id));

    let sum = 0;
    let count = 0;

    for (const res of responses) {
      for (const ans of res.answers) {
        if (questionIds.has(ans.questionId)) {
          sum += ans.value;
          count++;
        }
      }
    }

    result[dim] = count > 0 ? Math.round(sum / count) : 0;
  }

  return result;
}

export function calculateOverallScore(dimensionScores: DimensionScores): number {
  const values = Object.values(dimensionScores);
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / values.length);
}

export function calculateTeamScores(
  responses: AssessmentResponse[],
  teams: string[]
): Record<string, DimensionScores> {
  const teamScoresMap: Record<string, DimensionScores> = {};

  for (const team of teams) {
    const teamResponses = responses.filter((r) => r.team === team);
    if (teamResponses.length > 0) {
      teamScoresMap[team] = calculateDimensionScores(teamResponses);
    }
  }

  return teamScoresMap;
}

export function getScoreCategory(score: number): 'Early Stage' | 'Developing' | 'Advanced' | 'AI Native' {
  if (score < 40) return 'Early Stage';
  if (score < 65) return 'Developing';
  if (score < 85) return 'Advanced';
  return 'AI Native';
}

/**
 * Shared utility mapping score to monochrome scale color hex values:
 * #C9D6D6 (low / <40) -> #6FA3A3 (mid / 40-69) -> #2A6F6F (high / >=70)
 */
export function getScoreColor(score: number): string {
  if (score >= 70) return '#2A6F6F';
  if (score >= 40) return '#6FA3A3';
  return '#C9D6D6';
}
