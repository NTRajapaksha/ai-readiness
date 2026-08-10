import { Question, Dimension } from '@/types';

export const DIMENSIONS: readonly Dimension[] = [
  'fluency',
  'integration',
  'culture',
  'risk',
  'leadership',
] as const;

export const DIMENSION_LABELS: Record<Dimension, string> = {
  fluency: 'Tool Fluency',
  integration: 'Workflow Integration',
  culture: 'Shared AI Culture',
  risk: 'Risk & Governance',
  leadership: 'Leadership Buy-In',
};

export const TEAMS = [
  'Sales',
  'Engineering',
  'Ops',
  'Marketing',
  'Support',
  'Product',
  'Finance',
  'Other',
] as const;

export const QUESTIONS: readonly Question[] = [
  {
    id: 'q1',
    dimension: 'fluency',
    type: 'likert',
    text: 'How often do you use an AI tool (ChatGPT, Copilot, Claude, etc.) in your actual work?',
    labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Every day'],
  },
  {
    id: 'q2',
    dimension: 'fluency',
    type: 'likert',
    text: 'If you needed to solve an unfamiliar problem tomorrow using AI, how confident would you feel?',
    labels: ['Not at all', 'A little', 'Somewhat', 'Confident', 'Very confident'],
  },
  {
    id: 'q3',
    dimension: 'integration',
    type: 'multiple_choice',
    text: 'Is there a task you have fully offloaded or automated using AI in the last month?',
    options: [
      'No, not yet',
      'I tried but it didn’t stick',
      'Yes, one small task',
      'Yes, several tasks',
    ],
  },
  {
    id: 'q4',
    dimension: 'integration',
    type: 'likert',
    text: 'How much of your weekly workflow involves an AI tool at some step?',
    labels: ['None', 'A little', 'Some', 'A lot', 'Most of it'],
  },
  {
    id: 'q5',
    dimension: 'culture',
    type: 'likert',
    text: 'Does your team share prompts, workflows, or AI practices with each other?',
    labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Constantly'],
  },
  {
    id: 'q6',
    dimension: 'culture',
    type: 'multiple_choice',
    text: 'When someone on your team finds a useful AI trick, what usually happens?',
    options: [
      'It stays with them',
      'They mention it in passing',
      'They show one or two people',
      'It gets shared with the whole team',
    ],
  },
  {
    id: 'q7',
    dimension: 'risk',
    type: 'likert',
    text: 'How clear are you on what data is safe to put into an AI tool at work?',
    labels: ['Not clear at all', 'A little unclear', 'Somewhat clear', 'Clear', 'Very clear'],
  },
  {
    id: 'q8',
    dimension: 'risk',
    type: 'multiple_choice',
    text: 'Has your team ever discussed AI risk, privacy, or accuracy concerns openly?',
    options: ['Never', 'Once, briefly', 'A few times', 'Regularly'],
  },
  {
    id: 'q9',
    dimension: 'leadership',
    type: 'likert',
    text: 'How actively does your team leadership encourage, sponsor, and allocate time or budget for AI tools?',
    labels: ['Restricts / discourages', 'Passively permits', 'Encourages informally', 'Sponsors tools & time', 'Active executive mandate'],
  },
  {
    id: 'q10',
    dimension: 'leadership',
    type: 'multiple_choice',
    text: 'Has leadership established clear goals, safety guidance, or resource backing for AI in your workflow?',
    options: [
      'No guidance or support',
      'Vague suggestions only',
      'Clear team guidance',
      'Explicit roadmap & budget backing',
    ],
  },
  {
    id: 'q11',
    dimension: 'integration',
    type: 'text_optional',
    text: 'Optional: What is one repetitive task you wish AI could help with, but currently doesn’t?',
  },
] as const;
