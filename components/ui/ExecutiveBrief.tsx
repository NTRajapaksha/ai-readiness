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
      if (data.interpretation) {
        setBrief(data.interpretation);
        setSource(data.source);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Find lowest and highest scoring teams
  const sortedTeams = Object.entries(teamScores || {}).sort((a, b) => {
    const scoreA = Object.values(a[1]).reduce((acc, v) => acc + v, 0) / 4;
    const scoreB = Object.values(b[1]).reduce((acc, v) => acc + v, 0) / 4;
    return scoreB - scoreA;
  });

  const leadingTeam = sortedTeams[0]?.[0] || 'Engineering';
  const laggingTeam = sortedTeams[sortedTeams.length - 1]?.[0] || 'Sales';
  const lowestDimEntry = Object.entries(dimensionScores || {}).sort((a, b) => a[1] - b[1])[0];
  const lowestDimName = lowestDimEntry ? lowestDimEntry[0].toUpperCase() : 'INTEGRATION';
  const lowestDimScore = lowestDimEntry ? lowestDimEntry[1] : 51;

  return (
    <div className="p-6 bg-surface border border-borderCustom rounded-lg space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center text-white text-[11px] font-bold font-mono shadow-sm">
            AI
          </div>
          <div>
            <span className="data-label text-ink block">AI Executive Brief & Strategic Synthesis</span>
            <span className="text-[11px] text-ink-muted">Scannable Insights & Priority Initiatives</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sleek Dynamic Provider Selector */}
          <div className="flex items-center gap-1.5 bg-surface-raised border border-borderCustom rounded px-2.5 py-1">
            <span className="text-[10px] font-mono text-ink-muted uppercase">Provider:</span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="text-[11px] font-mono bg-transparent text-ink font-semibold focus-visible:outline-none cursor-pointer"
            >
              <option value="auto">Auto-Detect</option>
              <option value="openai">OpenAI (GPT-4o)</option>
              <option value="anthropic">Anthropic (Claude 3.5)</option>
              <option value="gemini">Google (Gemini Flash)</option>
              <option value="groq">Groq (Llama 3.3)</option>
            </select>
          </div>

          {source && (
            <span className="text-[10px] font-mono px-2.5 py-1 bg-accent-light text-accent-dark rounded uppercase font-semibold whitespace-nowrap">
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
          <div className="p-3.5 bg-accent-light border border-accent/20 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span className="text-xs font-semibold text-accent-dark">
                Primary Bottleneck: <span className="font-mono">{lowestDimName} ({lowestDimScore}/100)</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 bg-surface-raised border border-borderCustom rounded text-ink">
                Leader: {leadingTeam}
              </span>
              <span className="px-2 py-0.5 bg-surface-raised border border-borderCustom rounded text-accent-dark font-bold">
                Lag: {laggingTeam}
              </span>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-borderCustom pb-2">
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                activeTab === 'insights'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-surface-raised border border-borderCustom text-ink-muted hover:text-ink'
              }`}
            >
              📊 Key Strategic Takeaways
            </button>
            <button
              onClick={() => setActiveTab('initiative')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                activeTab === 'initiative'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-surface-raised border border-borderCustom text-ink-muted hover:text-ink'
              }`}
            >
              🚀 Priority 1 Initiative
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                activeTab === 'wishlist'
                  ? 'bg-accent text-white font-semibold'
                  : 'bg-surface-raised border border-borderCustom text-ink-muted hover:text-ink'
              }`}
            >
              💬 Team Wishlist Themes ({qualitativeWishes.length})
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
                  <strong className="text-ink">{laggingTeam} & Support</strong> suffer severe adoption friction due to low tool fluency and workflow integration.
                </p>
              </div>

              <div className="p-4 bg-surface-raised border border-borderCustom rounded-lg space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span className="text-accent-dark font-bold">🛡️</span> Governance Barrier
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Risk controls are high in Ops, but uncertainty about data safety halts routine daily task automation.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Priority 1 Initiative */}
          {activeTab === 'initiative' && (
            <div className="p-5 bg-surface-raised border border-borderCustom rounded-lg space-y-3 border-l-4 border-l-accent fade-in-quiet">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-accent-light text-accent-dark text-[10px] font-mono uppercase font-bold rounded">
                    Recommended First Move
                  </span>
                  <h4 className="font-sans font-semibold text-ink text-sm sm:text-base">
                    Automated Support-to-Engineering Integration Pipeline
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-ink-muted bg-surface px-2.5 py-1 rounded border border-borderCustom">
                  Target: Support & Engineering
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-3 border-l-2 border-borderCustom">
                Automatically ingest customer support tickets, parse recurring sentiment & bug themes, and auto-generate prioritized Jira issues directly into Engineering&apos;s sprint workflow.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2 py-0.5 bg-surface border border-borderCustom rounded text-[10px] font-mono text-ink">
                  ✓ Closes Support Integration Gap ({dimensionScores.integration}/100)
                </span>
                <span className="px-2 py-0.5 bg-surface border border-borderCustom rounded text-[10px] font-mono text-ink">
                  ✓ High ROI Automation
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Team Wishlist Themes */}
          {activeTab === 'wishlist' && (
            <div className="p-5 bg-surface-raised border border-borderCustom rounded-lg space-y-3 fade-in-quiet">
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
          <div className="pt-2 border-t border-borderCustom flex items-center justify-between text-[11px] font-mono text-ink-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Synthesized via {source || 'Tai Labs AI Engine'}</span>
            </div>
            <button
              onClick={() => handleGenerateBrief(provider)}
              disabled={loading}
              className="text-accent hover:text-accent-dark hover:underline font-semibold focus-visible:outline-none transition-colors"
            >
              {loading ? 'Refreshing...' : 'Re-generate Brief 🔄'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
