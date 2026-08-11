export interface DynamicTopic {
  phrase: string;
  tag: string;
  percent: number;
  count: number;
  keyword: string;
  matchedItems: string[];
  border: string;
  bg: string;
  badge: string;
}

export function extractDynamicTopics(items: string[]): DynamicTopic[] {
  if (!items || !Array.isArray(items) || items.length === 0) return [];

  const categories = [
    {
      id: 'jira_meeting',
      phrase: 'Meeting Summaries & Task Tracking',
      tag: 'High ROI Automation',
      keywords: ['jira', 'meeting', 'summary', 'summarize', 'notes', 'agenda', 'commit', 'git', 'task'],
      border: 'border-taiViolet/40 hover:border-taiViolet',
      bg: 'bg-taiViolet/5 hover:bg-taiViolet/10',
      badge: 'bg-taiViolet/15 text-taiViolet',
    },
    {
      id: 'legal_contract',
      phrase: 'Contract & Document Compliance',
      tag: 'Risk & Safety',
      keywords: ['contract', 'compliance', 'clause', 'legal', 'policy', 'regulation', 'pdf', 'document', 'review', 'confidential'],
      border: 'border-taiCoral/40 hover:border-taiCoral',
      bg: 'bg-taiCoral/5 hover:bg-taiCoral/10',
      badge: 'bg-taiCoral/15 text-taiCoral',
    },
    {
      id: 'support_triage',
      phrase: 'Customer Support & Ticket Triage',
      tag: 'Workflow Integration',
      keywords: ['support', 'ticket', 'customer', 'feedback', 'bug', 'inquiry', 'inquiries', 'triage', 'chat', 'issue'],
      border: 'border-accent/40 hover:border-accent',
      bg: 'bg-accent/5 hover:bg-accent/10',
      badge: 'bg-accent/15 text-accent-dark',
    },
    {
      id: 'content_translation',
      phrase: 'Content Drafting & Localization',
      tag: 'Tool Fluency',
      keywords: ['translate', 'translation', 'language', 'outreach', 'email', 'guide', 'draft', 'content', 'writing', 'copy', 'linkedin'],
      border: 'border-borderCustom hover:border-ink/40',
      bg: 'bg-surface-raised hover:bg-surface',
      badge: 'bg-surface border border-borderCustom text-ink-muted',
    },
    {
      id: 'invoice_data',
      phrase: 'Invoice & Data Extraction',
      tag: 'Admin Automation',
      keywords: ['invoice', 'vendor', 'accounting', 'spreadsheet', 'data', 'extract', 'extraction', 'excel', 'lead', 'leads', 'csv', 'finance'],
      border: 'border-borderCustom hover:border-ink/40',
      bg: 'bg-surface-raised hover:bg-surface',
      badge: 'bg-surface border border-borderCustom text-ink-muted',
    },
  ];

  const categoryMatchedItems: Record<string, string[]> = {};
  categories.forEach((cat) => {
    categoryMatchedItems[cat.id] = [];
  });

  const uncategorizedItems: string[] = [];

  items.forEach((item) => {
    if (typeof item !== 'string') return;
    const lower = item.toLowerCase();
    let matched = false;

    for (const cat of categories) {
      if (cat.keywords.some((kw) => lower.includes(kw))) {
        categoryMatchedItems[cat.id].push(item);
        matched = true;
        break;
      }
    }

    if (!matched) {
      uncategorizedItems.push(item);
    }
  });

  const totalInputs = items.length;
  const result: DynamicTopic[] = [];

  categories.forEach((cat) => {
    const matchedList = categoryMatchedItems[cat.id];
    if (matchedList.length > 0) {
      const percent = Math.max(1, Math.round((matchedList.length / totalInputs) * 100));
      result.push({
        phrase: cat.phrase,
        tag: cat.tag,
        percent,
        count: matchedList.length,
        keyword: cat.keywords[0],
        matchedItems: matchedList,
        border: cat.border,
        bg: cat.bg,
        badge: cat.badge,
      });
    }
  });

  // If there are unclassified inputs, add a General Workflow category
  if (uncategorizedItems.length > 0) {
    const percent = Math.max(1, Math.round((uncategorizedItems.length / totalInputs) * 100));
    result.push({
      phrase: 'General Workflow Optimization',
      tag: 'General Integration',
      percent,
      count: uncategorizedItems.length,
      keyword: 'general',
      matchedItems: uncategorizedItems,
      border: 'border-borderCustom hover:border-ink/40',
      bg: 'bg-surface-raised hover:bg-surface',
      badge: 'bg-surface border border-borderCustom text-ink-muted',
    });
  }

  // Sort by highest demand share percentage
  return result.sort((a, b) => b.percent - a.percent);
}
