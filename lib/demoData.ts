import { AssessmentResponse, Answer } from '@/types';

/**
 * TOGGLE DEMO MODE HERE
 * Set to false or remove this file to disable demo data generation entirely.
 */
export const ENABLE_DEMO_MODE = true;

export function generateSampleResponses(businessId: string): AssessmentResponse[] {
  const sampleData: AssessmentResponse[] = [];

  const responseConfigs = [
    // Engineering (High Fluency, High Integration, Moderate Risk/Culture)
    { team: 'Engineering', fluency: 85, integration: 80, culture: 65, risk: 70 },
    { team: 'Engineering', fluency: 90, integration: 85, culture: 70, risk: 75 },
    { team: 'Engineering', fluency: 75, integration: 75, culture: 60, risk: 60 },
    
    // Sales (Moderate Fluency, Low Integration, Low Culture, Low Risk awareness)
    { team: 'Sales', fluency: 45, integration: 25, culture: 30, risk: 35 },
    { team: 'Sales', fluency: 50, integration: 30, culture: 25, risk: 40 },
    { team: 'Sales', fluency: 40, integration: 20, culture: 35, risk: 30 },

    // Ops (Moderate Fluency, High Risk awareness, Low Integration)
    { team: 'Ops', fluency: 55, integration: 40, culture: 50, risk: 80 },
    { team: 'Ops', fluency: 60, integration: 45, culture: 45, risk: 85 },

    // Marketing (High Fluency, Moderate Integration, Moderate Culture, Low Risk)
    { team: 'Marketing', fluency: 80, integration: 65, culture: 75, risk: 40 },
    { team: 'Marketing', fluency: 85, integration: 70, culture: 80, risk: 45 },

    // Support (Low Fluency, Low Integration, High Culture)
    { team: 'Support', fluency: 35, integration: 30, culture: 60, risk: 50 },
  ];

  // 11 distinct, non-duplicative qualitative team wishlist submissions
  const wishlists = [
    'Automating meeting summaries and updating Jira tickets directly.',
    'Drafting personalized cold outreach emails based on prospect LinkedIn data.',
    'Checking customer contract clauses against internal compliance regulations.',
    'Synthesizing weekly customer support feedback tickets into prioritized bug reports.',
    'Translating technical user guides into multiple international language variants.',
    'Generating release notes automatically from recent Git commit messages.',
    'Extracting data points from vendor PDF invoices directly into accounting spreadsheets.',
    'Summarizing competitor product announcements and highlighting feature gaps.',
    'Auto-generating test cases and unit assertions from API spec docs.',
    'Categorizing inbound sales leads based on company size and tech stack.',
    'Drafting responses for recurring customer support inquiries with verified docs.',
  ];

  responseConfigs.forEach((config, idx) => {
    const answers: Answer[] = [
      { questionId: 'q1', value: config.fluency, rawAnswer: 4 },
      { questionId: 'q2', value: config.fluency, rawAnswer: 4 },
      { questionId: 'q3', value: config.integration, rawAnswer: 2 },
      { questionId: 'q4', value: config.integration, rawAnswer: 3 },
      { questionId: 'q5', value: config.culture, rawAnswer: 3 },
      { questionId: 'q6', value: config.culture, rawAnswer: 2 },
      { questionId: 'q7', value: config.risk, rawAnswer: config.risk > 50 ? 4 : 2 },
      { questionId: 'q8', value: config.risk, rawAnswer: config.risk > 50 ? 3 : 1 },
      { questionId: 'q9', value: config.fluency, rawAnswer: 2 },
    ];

    sampleData.push({
      id: `resp-demo-${idx + 1}`,
      businessId,
      team: config.team,
      createdAt: new Date(Date.now() - idx * 3600000 * 4).toISOString(),
      answers,
      qualitativeWish: wishlists[idx],
    });
  });

  return sampleData;
}
