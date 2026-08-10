import { DimensionScores, Recommendation, Dimension, PlaybookStep } from '@/types';
import { DIMENSION_LABELS, DIMENSIONS } from './questions';

function getTeamPlaybook(dim: Dimension, teamName: string): PlaybookStep[] {
  switch (dim) {
    case 'fluency':
      return [
        {
          week: 'Week 1',
          title: `${teamName} Baseline & Tool Provisioning`,
          action: `Conduct a 30-minute tool audit with ${teamName} leads to ensure verified access to enterprise LLM tools and resolve prompt friction.`,
          deliverable: `100% ${teamName} tool access confirmation.`,
        },
        {
          week: 'Week 2',
          title: `${teamName} Foundational Prompting Workshop`,
          action: `Run a hands-on lab tailored to ${teamName}'s core deliverables, covering context setting, system roles, and structured output formatting.`,
          deliverable: `${teamName} starter prompt cheat-sheet.`,
        },
        {
          week: 'Week 3',
          title: `${teamName} Routine Task Sprint`,
          action: `Have each ${teamName} member complete one routine drafting or research task using AI tools, logging time saved.`,
          deliverable: `${teamName} tool fluency assessment log.`,
        },
      ];

    case 'integration':
      return [
        {
          week: 'Week 1',
          title: `${teamName} Task Automation Audit`,
          action: `Audit ${teamName}'s top manual processes to select one high-frequency workflow (taking >3 hrs/week) for template automation.`,
          deliverable: `${teamName} workflow automation spec.`,
        },
        {
          week: 'Week 2',
          title: `${teamName} Custom Template Prototyping`,
          action: `Co-build a standardized AI prompt template or workflow automation script tailored specifically to ${teamName} daily tasks.`,
          deliverable: `Tested ${teamName} workflow template.`,
        },
        {
          week: 'Week 3',
          title: `${teamName} Workflow Rollout & ROI Check`,
          action: `Deploy the automated workflow across all ${teamName} members and measure weekly processing time reduction.`,
          deliverable: `${teamName} task automation ROI report.`,
        },
      ];

    case 'culture':
      return [
        {
          week: 'Week 1',
          title: `${teamName} Internal Repository Setup`,
          action: `Create a dedicated prompt-sharing channel and central repository for ${teamName} members to post successful workflows.`,
          deliverable: `${teamName} prompt repository setup.`,
        },
        {
          week: 'Week 2',
          title: `${teamName} Peer Demo Standup`,
          action: `Host a 20-minute showcase where ${teamName} members demo prompts and techniques that saved significant time during the week.`,
          deliverable: `Recorded ${teamName} prompt walkthrough.`,
        },
        {
          week: 'Week 3',
          title: `${teamName} Cross-Team Buddy Pairing`,
          action: `Pair ${teamName} members with AI champions from higher-scoring departments for weekly co-working and prompt exchange.`,
          deliverable: `${teamName} peer coaching log.`,
        },
      ];

    case 'risk':
      return [
        {
          week: 'Week 1',
          title: `${teamName} Data Boundary Review`,
          action: `Review company data classification rules with ${teamName} leads, identifying specific green/yellow/red data types in their daily work.`,
          deliverable: `${teamName}-specific data safety checklist.`,
        },
        {
          week: 'Week 2',
          title: `${teamName} PII Masking & Privacy Training`,
          action: `Run a hands-on session demonstrating how ${teamName} members must sanitize customer PII and sensitive documents before prompting.`,
          deliverable: `100% ${teamName} compliance sign-off.`,
        },
        {
          week: 'Week 3',
          title: `${teamName} Compliance & Extension Audit`,
          action: `Audit browser extensions and AI tools used by ${teamName} to ensure full alignment with enterprise security policy.`,
          deliverable: `${teamName} approved tool registry.`,
        },
      ];

    case 'leadership':
      return [
        {
          week: 'Week 1',
          title: `${teamName} Executive Sponsor Alignment`,
          action: `Host an executive alignment sync between ${teamName} department leads and executive sponsors to define explicit AI goals.`,
          deliverable: `${teamName} AI strategic mandate statement.`,
        },
        {
          week: 'Week 2',
          title: `${teamName} Tool Budget & Time Allocation`,
          action: `Approve official tool licenses and allocate 2 hours/week of dedicated, protected learning time for ${teamName} members.`,
          deliverable: `Approved ${teamName} tool budget & schedule.`,
        },
        {
          week: 'Week 3',
          title: `${teamName} Executive Milestone Review`,
          action: `Establish bi-weekly progress review syncs between ${teamName} leads and executive sponsors to track adoption metrics.`,
          deliverable: `${teamName} executive adoption report.`,
        },
      ];

    default:
      return [
        {
          week: 'Week 1',
          title: `${teamName} Diagnostic Alignment`,
          action: `Review specific low-scoring survey responses with ${teamName} department leads.`,
          deliverable: 'Tailored 3-week sprint goal.',
        },
        {
          week: 'Week 2',
          title: 'Targeted Hands-On Coaching',
          action: `Run a dedicated 60-minute workshop tailored exclusively to ${teamName}'s daily deliverables.`,
          deliverable: `Custom prompt library for ${teamName}.`,
        },
        {
          week: 'Week 3',
          title: 'Buddy Pairing Sync',
          action: `Pair ${teamName} members with advanced champions from top-performing departments for co-working.`,
          deliverable: 'Peer coaching check-in log.',
        },
      ];
  }
}

export function generateRecommendations(
  overallDimsInput: DimensionScores,
  teamDimsInput: Record<string, DimensionScores>
): Recommendation[] {
  const recs: Recommendation[] = [];

  const overallDims: DimensionScores = {
    fluency: overallDimsInput?.fluency ?? 0,
    integration: overallDimsInput?.integration ?? 0,
    culture: overallDimsInput?.culture ?? 0,
    risk: overallDimsInput?.risk ?? 0,
    leadership: overallDimsInput?.leadership ?? 0,
  };

  const teamDims = teamDimsInput || {};

  // Business-wide weak signals (< 50)
  if (overallDims.fluency < 50) {
    recs.push({
      id: 'rec-fluency-org',
      title: 'Roll out hands-on AI tool fundamentals',
      description: 'Your team is early in daily usage—launch a 4-week practical lab focused on prompt framing and routine task assistance.',
      priority: 'high',
      dimension: 'fluency',
      playbook: [
        {
          week: 'Week 1',
          title: 'Tool Baseline & Setup Audit',
          action: 'Provide all team members verified accounts on Claude/ChatGPT and conduct a 30-minute onboarding demo.',
          deliverable: '100% team tool provisioning and access confirmation.',
        },
        {
          week: 'Week 2',
          title: 'Prompt Framing & Structure',
          action: 'Run a hands-on lab demonstrating context setting, zero-shot vs few-shot prompting for routine tasks.',
          deliverable: 'Department Cheat-Sheet of 5 verified starter prompts.',
        },
        {
          week: 'Week 3',
          title: 'Practical Work Integration',
          action: 'Challenge each member to complete one real weekly document or email draft using AI assistance.',
          deliverable: 'Team retrospective log of time saved.',
        },
      ],
    });
  }

  if (overallDims.culture < 50) {
    recs.push({
      id: 'rec-culture-org',
      title: 'Establish weekly peer prompt-sharing sessions',
      description: 'Individuals are experimenting in isolation—create a dedicated channel or 15-minute weekly standup to demo workflows that worked.',
      priority: 'high',
      dimension: 'culture',
      playbook: [
        {
          week: 'Week 1',
          title: 'Internal Prompt Repository Setup',
          action: 'Create a dedicated #ai-learnings Slack/Teams channel and starter prompt doc.',
          deliverable: 'Shared library repository setup.',
        },
        {
          week: 'Week 2',
          title: 'First Weekly Demo Standup',
          action: 'Host a 15-minute Friday standup where two team members showcase a prompt that saved >30 minutes.',
          deliverable: 'Recorded 5-minute prompt walkthrough.',
        },
        {
          week: 'Week 3',
          title: 'Peer Prompt Bounties',
          action: 'Recognize top contributed workflows during bi-weekly team syncs.',
          deliverable: 'Updated central prompt playbook.',
        },
      ],
    });
  }

  if (overallDims.risk < 50) {
    recs.push({
      id: 'rec-risk-org',
      title: 'Publish a 1-page data classification guide for AI tools',
      description: 'Team members lack clarity on sensitive data—define explicit green/yellow/red rules on what customer data can enter external tools.',
      priority: 'high',
      dimension: 'risk',
      playbook: [
        {
          week: 'Week 1',
          title: 'Data Classification Matrix Draft',
          action: 'Draft a 1-page table categorizing Public (Green), Internal (Yellow), and Strictly Confidential (Red) data.',
          deliverable: 'Approved 1-page Data Safety PDF.',
        },
        {
          week: 'Week 2',
          title: 'Data Masking & Privacy Training',
          action: 'Demonstrate how to anonymize customer PII and proprietary code before entering prompts.',
          deliverable: '100% team sign-off on risk guidelines.',
        },
        {
          week: 'Week 3',
          title: 'Approved AI Tool Registry',
          action: 'Publish list of enterprise-approved AI tools and browser extensions.',
          deliverable: 'Central compliance directory.',
        },
      ],
    });
  }

  if (overallDims.integration < 50) {
    recs.push({
      id: 'rec-integration-org',
      title: 'Identify and automate one recurring workflow per department',
      description: 'Tool knowledge is not translating into daily workflows—challenge each team lead to select single high-frequency task for automation.',
      priority: 'medium',
      dimension: 'integration',
      playbook: [
        {
          week: 'Week 1',
          title: 'High-Frequency Task Audit',
          action: 'Identify the top 3 repetitive manual tasks taking >3 hours per week per member.',
          deliverable: 'Ranked task automation backlog.',
        },
        {
          week: 'Week 2',
          title: 'Workflow Template Prototyping',
          action: 'Co-build a standardized AI prompt template or workflow script for the top manual task.',
          deliverable: 'Tested workflow template.',
        },
        {
          week: 'Week 3',
          title: 'Workflow Adoption Measurement',
          action: 'Deploy template across team and measure weekly reduction in processing time.',
          deliverable: 'Automation ROI metric report.',
        },
      ],
    });
  }

  if (overallDims.leadership < 50) {
    recs.push({
      id: 'rec-leadership-org',
      title: 'Align executive sponsorship & clear AI resource allocation',
      description: 'Employees report low leadership buy-in—executives must establish clear AI goals, explicit tool budgets, and dedicated learning time.',
      priority: 'high',
      dimension: 'leadership',
      playbook: [
        {
          week: 'Week 1',
          title: 'Executive Sponsor Sync',
          action: 'Host a 45-minute leadership alignment session to define official AI objectives and data boundaries.',
          deliverable: 'Executive AI Mandate Statement.',
        },
        {
          week: 'Week 2',
          title: 'Resource & Budget Provisioning',
          action: 'Approve official tool licenses (Claude, ChatGPT Enterprise, Copilot) and dedicate 2 hours/week for training.',
          deliverable: 'Approved enterprise AI tool budget.',
        },
        {
          week: 'Week 3',
          title: 'Leadership Milestone Review',
          action: 'Establish bi-weekly ROI review meetings between department leads and executive sponsors.',
          deliverable: 'Executive AI Adoption Dashboard.',
        },
      ],
    });
  }

  // Team-specific gaps (lagging org average by >= 20 points)
  for (const [teamName, dims] of Object.entries(teamDims)) {
    if (!dims) continue;

    for (const dim of DIMENSIONS) {
      const overallVal = overallDims[dim] ?? 0;
      const teamVal = dims[dim] ?? 0;
      const gap = overallVal - teamVal;

      if (gap >= 20) {
        const dimLabel = DIMENSION_LABELS[dim] || 'Readiness';
        let specText = `${teamName} is behind on ${dimLabel.toLowerCase()}—schedule a targeted workshop to bridge this gap before broader rollouts.`;
        
        if (dim === 'fluency') {
          specText = `${teamName} is behind on tool fluency—start with the foundational tool mechanics track to build baseline confidence.`;
        } else if (dim === 'risk') {
          specText = `${teamName} shows significant uncertainty regarding AI data policies—run a focused risk alignment session with team leadership.`;
        } else if (dim === 'integration') {
          specText = `${teamName} hasn't embedded AI into daily workflows—partner with a technical coach to prototype an automated department template.`;
        } else if (dim === 'culture') {
          specText = `${teamName} operates in silos without sharing prompt discoveries—pair them with an advanced peer team for co-working sessions.`;
        } else if (dim === 'leadership') {
          specText = `${teamName} reports lack of leadership buy-in and resource backing—arrange an executive sync with ${teamName} department leads.`;
        }

        recs.push({
          id: `rec-${teamName}-${dim}`,
          title: `${teamName}: Bridge ${dimLabel} Gap`,
          description: specText,
          priority: 'high',
          targetTeam: teamName,
          dimension: dim,
          playbook: getTeamPlaybook(dim, teamName),
        });
      }
    }
  }

  // Fallback recommendation if company is doing very well overall
  if (recs.length === 0) {
    recs.push({
      id: 'rec-advanced-coaching',
      title: 'Scale custom agentic workflows across lead teams',
      description: 'Your organization shows strong baseline readiness—transition from individual prompting to custom internal AI agents and API integrations.',
      priority: 'medium',
      dimension: 'integration',
      playbook: [
        {
          week: 'Week 1',
          title: 'Custom Agent Architecture',
          action: 'Evaluate high-value multi-step workflows for automated RAG or custom agent pipeline integration.',
          deliverable: 'Agentic workflow PRD.',
        },
        {
          week: 'Week 2',
          title: 'Internal Tooling Prototype',
          action: 'Build a prototype internal assistant connected to department knowledge bases.',
          deliverable: 'Internal beta tool.',
        },
        {
          week: 'Week 3',
          title: 'Org-Wide Scaling',
          action: 'Roll out tool access and run executive training session.',
          deliverable: 'Full production deployment.',
        },
      ],
    });
  }

  // Sort by priority (high first, stable)
  return recs.sort((a, b) => {
    if (a.priority === b.priority) return 0;
    return a.priority === 'high' ? -1 : 1;
  });
}
