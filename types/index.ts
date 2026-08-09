export type Dimension = 'fluency' | 'integration' | 'culture' | 'risk';

export type QuestionType = 'likert' | 'multiple_choice' | 'text_optional';

export interface Question {
  id: string;
  dimension: Dimension;
  type: QuestionType;
  text: string;
  labels?: readonly string[];
  options?: readonly string[];
}

export interface Answer {
  questionId: string;
  value: number; // Normalized 0-100 score internally
  rawAnswer: string | number;
}

export interface AssessmentResponse {
  id: string;
  businessId: string;
  team: string;
  createdAt: string;
  answers: Answer[];
  qualitativeWish?: string;
}

export interface Business {
  id: string;
  name: string;
  createdAt: string;
  teams: string[];
}

export type DimensionScores = Record<Dimension, number>;

export interface PlaybookStep {
  week: string;
  title: string;
  action: string;
  deliverable: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium';
  targetTeam?: string;
  dimension: Dimension;
  playbook: PlaybookStep[];
}

export interface DiagnosticReport {
  business: Business;
  totalResponses: number;
  overallScore: number;
  scoreCategory: 'Early Stage' | 'Developing' | 'Advanced' | 'AI Native';
  dimensionScores: DimensionScores;
  teamScores: Record<string, DimensionScores>;
  recommendations: Recommendation[];
  qualitativeFeedback: string[];
  responsesByTeam: Record<string, number>;
}
