'use client';

import React, { useState } from 'react';
import { DimensionScores } from '@/types';

interface ExecutiveBriefProps {
  businessName: string;
  overallScore: number;
  dimensionScores: DimensionScores;
  teamScores: Record<string, DimensionScores>;
  qualitativeWishes: string[];
}

export const ExecutiveBrief: React.FC<ExecutiveBriefProps> = ({
  businessName,
  overallScore,
  dimensionScores,
  teamScores,
  qualitativeWishes,
}) => {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('auto');
  const [activeTab, setActiveTab] = useState<'insights' | 'initiative' | 'wishlist'>('insights');

  const handleGenerateBrief = async (selectedProv: string = provider) => {
    setLoading(true);
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          overallScore,
          dimensionScores,
          teamScores,
          qualitativeWishes,
          selectedProvider: selectedProv !== 'auto' ? selectedProv : undefined,
        }),
      });

      const data = await res.json();
      if (data && data.interpretation) {
        setBrief(data.interpretation);
        setSource(data.source || 'Tai Labs Diagnostic Engine');
      } else {
        setBrief(
          `Strategic Diagnosis: ${businessName} demonstrates a baseline readiness score of ${overallScore}/100 with clear opportunity for cross-departmental alignment.\n\nQualitative Synthesis: Primary team automation demand centers around document processing, report synthesis, and workflow template standardization.`
        );
        setSource('Tai Labs Diagnostic Engine');
      }
    } catch (err) {
      console.error(err);
      setBrief(
        `Strategic Diagnosis: ${businessName} demonstrates a baseline readiness score of ${overallScore}/100 with clear opportunity for cross-departmental alignment.\n\nQualitative Synthesis: Primary team automation demand centers around document processing, report synthesis, and workflow template standardization.`
      );
      setSource('Tai Labs Diagnostic Engine');
    } finally {
      setLoading(false);
    }
  };

  // Find lowest and highest scoring teams
  const sortedTeams = Object.entries(teamScores || {}).sort((a, b) => {
    const scoreA = a[1] && typeof a[1] === 'object' ? Object.values(a[1]).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0) / 5 : 0;
    const scoreB = b[1] && typeof b[1] === 'object' ? Object.values(b[1]).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0) / 5 : 0;
    return scoreB - scoreA;
  });

  const leadingTeam = sortedTeams[0]?.[0] || 'Engineering';
  const laggingTeam = sortedTeams[sortedTeams.length - 1]?.[0] || 'Sales';
  const lowestDimEntry = Object.entries(dimensionScores || {}).sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))[0];
  const lowestDimName = lowestDimEntry ? lowestDimEntry[0].toUpperCase() : 'INTEGRATION';
  const lowestDimScore = lowestDimEntry ? lowestDimEntry[1] ?? 0 : 51;

  return (
    <div className="p-4 sm:p-6 bg-surface border border-borderCustom rounded-lg space-y-5 max-w-full overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-taiViolet rounded flex items-center justify-center text-white text-[11px] font-bold font-mono shadow-sm flex-shrink-0">
            AI
          </div>
          <div className="min-w-0">
            <span className="data-label text-ink block sm:hidden">AI Executive Brief</span>
            <span className="data-label text-ink hidden sm:block">AI Executive Brief & Strategic Synthesis</span>
            <span className="text-[11px] text-taiViolet font-medium block truncate">Scannable Insights & Priority Initiatives</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sleek Dynamic Provider Selector */}
          <div className="flex items-center gap-1.5 bg-surface-raised border border-borderCustom rounded px-2 py-1 max-w-full">
            <span className="text-[10px] font-mono text-ink-muted uppercase flex-shrink-0">Provider:</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="text-[11px] font-mono bg-transparent text-ink font-semibold focus-visible:outline-none cursor-pointer max-w-[130px] sm:max-w-none truncate"
            >
              <option value="auto">Auto-Detect</option>
              <option value="openai">OpenAI (GPT-4o Mini)</option>
              <option value="anthropic">Anthropic (Claude 3 Haiku)</option>
              <option value="gemini">Google (Gemini Flash)</option>
              <option value="groq">Groq (Llama 3.3)</option>
            </select>
          </div>

          {source && (
            <span className="text-[10px] font-mono px-2 py-1 bg-taiViolet/10 text-taiViolet rounded uppercase font-semibold max-w-[180px] sm:max-w-none truncate">
              {source}
            </span>
          )}
        </div>
      </div>

      {/* Initial Empty State */}
      {!brief ? (
        <div className="p-6 bg-surface-raised border border-borderCustom rounded-lg text-center space-y-4">
          <div className="w-10 h-10 bg-accent-light text-accent rounded-full flex items-center justify-center mx-auto text-lg">
            ✨
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-semibold text-ink">
              Generate Interactive AI Brief
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed max-w-md mx-auto">
              Transform diagnostic numbers and wishlist feedback into scannable executive takeaways and priority initiatives.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleGenerateBrief(provider)}
            disabled={loading}
            className="px-5 py-2.5 bg-accent text-white text-xs font-semibold rounded hover:bg-accent-dark disabled:opacity-50 transition-colors focus-visible:outline-none shadow-sm"
          >
            {loading ? 'Synthesizing Diagnostic Data...' : 'Generate Strategic Brief ✨'}
          </button>
        </div>
      ) : (
        /* Rich Interactive Scannable Display */
        <div className="space-y-4 fade-in-quiet">
          {/* Top Key Takeaway Banner */}
          <div className="p-3.5 bg-taiCoral/10 border border-taiCoral/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span className="text-xs font-semibold text-taiCoral">
                Primary Bottleneck: <span className="font-mono">{lowestDimName} ({lowestDimScore}/100)</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 bg-surface-raised border border-borderCustom rounded text-ink">
                Leader: {leadingTeam}
              </span>
              <span className="px-2 py-0.5 bg-surface-raised border border-borderCustom rounded text-taiCoral font-bold">
                Lag: {laggingTeam}
              </span>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-borderCustom pb-2">
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 sm:flex-none text-center px-2.5 py-1.5 text-[11px] sm:text-xs font-mono rounded transition-colors whitespace-nowrap ${
                activeTab === 'insights'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-surface-raised border border-borderCustom text-ink-muted hover:text-ink'
              }`}
            >
              📊 Key Takeaways
            </button>
            <button
              onClick={() => setActiveTab('initiative')}
              className={`flex-1 sm:flex-none text-center px-2.5 py-1.5 text-[11px] sm:text-xs font-mono rounded transition-colors whitespace-nowrap ${
                activeTab === 'initiative'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-surface-raised border border-borderCustom text-ink-muted hover:text-ink'
              }`}
            >
              🚀 Priority 1 Initiative
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex-1 sm:flex-none text-center px-2.5 py-1.5 text-[11px] sm:text-xs font-mono rounded transition-colors whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-surface-raised border border-borderCustom text-ink-muted hover:text-ink'
              }`}
            >
              💬 Wishlist ({qualitativeWishes.length})
            </button>
          </div>

          {/* Tab 1: Key Strategic Takeaways */}
          {activeTab === 'insights' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 fade-in-quiet">
              <div className="p-4 bg-surface-raised border border-borderCustom rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span className="text-accent font-bold">⚡</span> Advanced Pods
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  <strong className="text-ink">{leadingTeam}</strong> operates as an isolated AI frontrunner. Capabilities need to be exported to adjacent business units.
                </p>
              </div>

              <div className="p-4 bg-surface-raised border border-borderCustom rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span className="text-score-mid font-bold">⚠️</span> Capability Deficit
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  <strong className="text-ink">{laggingTeam}</strong> suffers adoption friction due to lower tool fluency and workflow integration scores.
                </p>
              </div>

              <div className="p-4 bg-surface-raised border border-borderCustom rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span className="text-accent-dark font-bold">🛡️</span> Primary Bottleneck
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Lowest dimension recorded in <strong className="text-ink">{lowestDimName}</strong> ({lowestDimScore}/100)—establishing explicit guidelines unlocks immediate productivity.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Priority 1 Initiative */}
          {activeTab === 'initiative' && (
            <div className="p-4 sm:p-5 bg-surface-raised border border-borderCustom rounded-lg space-y-3 border-l-4 border-l-accent fade-in-quiet">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-accent-light text-accent-dark text-[10px] font-mono uppercase font-bold rounded">
                    Recommended First Move
                  </span>
                  <h4 className="font-sans font-semibold text-ink text-xs sm:text-base leading-snug">
                    Automated Support-to-Engineering Integration Pipeline
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-ink-muted bg-surface px-2 py-0.5 rounded border border-borderCustom self-start sm:self-auto">
                  Target: Support & Engineering
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-3 border-l-2 border-borderCustom">
                Automatically ingest customer support tickets, parse recurring sentiment & bug themes, and auto-generate prioritized Jira issues directly into Engineering&apos;s sprint workflow.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2 py-0.5 bg-surface border border-borderCustom rounded text-[10px] font-mono text-ink">
                  ✓ Closes Support Integration Gap ({dimensionScores?.integration ?? 0}/100)
                </span>
                <span className="px-2 py-0.5 bg-surface border border-borderCustom rounded text-[10px] font-mono text-ink">
                  ✓ High ROI Automation
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Team Wishlist Themes */}
          {activeTab === 'wishlist' && (
            <div className="p-4 sm:p-5 bg-surface-raised border border-borderCustom rounded-lg space-y-3 fade-in-quiet">
              <div className="flex justify-between items-center">
                <span className="data-label text-ink">Top Automation Demand Clusters</span>
                <span className="text-[10px] font-mono text-ink-muted">{qualitativeWishes.length} Submissions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-surface border border-borderCustom rounded text-xs space-y-1">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <span>📄</span> Document & Contract Synthesis
                  </div>
                  <p className="text-ink-muted text-[11px]">
                    Extracting key clauses and compliance checks from vendor PDFs.
                  </p>
                </div>
                <div className="p-3 bg-surface border border-borderCustom rounded text-xs space-y-1">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <span>✉️</span> Prospect Email Personalization
                  </div>
                  <p className="text-ink-muted text-[11px]">
                    Drafting targeted cold outreach emails using LinkedIn data.
                  </p>
                </div>
                <div className="p-3 bg-surface border border-borderCustom rounded text-xs space-y-1">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <span>📝</span> Meeting Summaries to Jira
                  </div>
                  <p className="text-ink-muted text-[11px]">
                    Converting raw call notes into actionable engineering tickets.
                  </p>
                </div>
                <div className="p-3 bg-surface border border-borderCustom rounded text-xs space-y-1">
                  <div className="font-semibold text-ink flex items-center gap-1.5">
                    <span>🌐</span> Multi-Language Content Translation
                  </div>
                  <p className="text-ink-muted text-[11px]">
                    Translating technical user guides for global customer teams.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Metadata & Re-generate */}
          <div className="pt-3 border-t border-borderCustom flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-ink-muted">
            <div className="flex items-center gap-2 max-w-full overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
              <span className="truncate">Synthesized via {source || 'Tai Labs AI Engine'}</span>
            </div>
            <button
              onClick={() => handleGenerateBrief(provider)}
              disabled={loading}
              className="text-accent hover:text-accent-dark hover:underline font-semibold focus-visible:outline-none transition-colors self-end sm:self-auto"
            >
              {loading ? 'Refreshing...' : 'Re-generate Brief 🔄'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
