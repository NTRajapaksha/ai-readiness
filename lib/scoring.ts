import { AssessmentResponse, Dimension, DimensionScores } from '@/types';
import { DIMENSIONS, QUESTIONS } from './questions';

export function normalizeLikert(value: number): number {
  // Value 1 -> 0%, Value 5 -> 100%
  const num = typeof value === 'number' ? value : Number(value) || 1;
  return Math.round(((Math.max(1, Math.min(5, num)) - 1) / 4) * 100);
}

export function normalizeMC(optionIndex: number, optionCount: number): number {
  if (optionCount <= 1) return 0;
  const idx = typeof optionIndex === 'number' ? optionIndex : Number(optionIndex) || 0;
  return Math.round((Math.max(0, Math.min(optionCount - 1, idx)) / (optionCount - 1)) * 100);
}

export function calculateDimensionScores(responses: AssessmentResponse[]): DimensionScores {
  const result: DimensionScores = {
    fluency: 0,
    integration: 0,
    culture: 0,
    risk: 0,
    leadership: 0,
  };

  if (!Array.isArray(responses) || responses.length === 0) return result;

  for (const dim of DIMENSIONS) {
    const dimQuestions = QUESTIONS.filter((q) => q.dimension === dim && q.type !== 'text_optional');
    const questionIds = new Set(dimQuestions.map((q) => q.id));

    let sum = 0;
    let count = 0;

    for (const res of responses) {
      if (!res || !Array.isArray(res.answers)) continue;

      for (const ans of res.answers) {
        if (ans && questionIds.has(ans.questionId)) {
          const val = typeof ans.value === 'number' ? ans.value : Number(ans.value) || 0;
          sum += val;
          count++;
        }
      }
    }

    result[dim] = count > 0 ? Math.round(sum / count) : 0;
  }

  return result;
}

export function calculateOverallScore(dimensionScores: DimensionScores): number {
  if (!dimensionScores || typeof dimensionScores !== 'object') return 0;
  const values = Object.values(dimensionScores).map((v) => (typeof v === 'number' ? v : Number(v) || 0));
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / values.length);
}

export function calculateTeamScores(
  responses: AssessmentResponse[],
  teams: string[]
): Record<string, DimensionScores> {
  const teamScoresMap: Record<string, DimensionScores> = {};
  if (!Array.isArray(responses) || !Array.isArray(teams)) return teamScoresMap;

  for (const team of teams) {
    if (!team) continue;
    const teamResponses = responses.filter((r) => r && r.team === team);
    if (teamResponses.length > 0) {
      teamScoresMap[team] = calculateDimensionScores(teamResponses);
    }
  }

  return teamScoresMap;
}

export function getScoreCategory(score: number): 'Early Stage' | 'Developing' | 'Advanced' | 'AI Native' {
  const num = typeof score === 'number' ? score : Number(score) || 0;
  if (num < 40) return 'Early Stage';
  if (num < 65) return 'Developing';
  if (num < 85) return 'Advanced';
  return 'AI Native';
}

/**
 * Shared utility mapping score to monochrome scale color hex values:
 * #C9D6D6 (low / <40) -> #6FA3A3 (mid / 40-69) -> #2A6F6F (high / >=70)
 */
export function getScoreColor(score: number): string {
  const num = typeof score === 'number' ? score : Number(score) || 0;
  if (num >= 70) return '#2A6F6F';
  if (num >= 40) return '#6FA3A3';
  return '#C9D6D6';
}
