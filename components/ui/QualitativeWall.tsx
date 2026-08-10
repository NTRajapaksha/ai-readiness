'use client';

import React, { useState } from 'react';

interface QualitativeWallProps {
  items: string[];
}

export const QualitativeWall: React.FC<QualitativeWallProps> = ({ items }) => {
  const [viewMode, setViewMode] = useState<'cloud' | 'quotes'>('cloud');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  if (!items || items.length === 0) return null;

  // Structured Topic Analytics with percentages and tag styles
  const topicPillData = [
    {
      phrase: 'Automating Jira & Summaries',
      tag: 'High ROI Automation',
      percent: 28,
      border: 'border-taiViolet/40 hover:border-taiViolet',
      bg: 'bg-taiViolet/5 hover:bg-taiViolet/10',
      badge: 'bg-taiViolet/15 text-taiViolet',
    },
    {
      phrase: 'Contract Compliance Checking',
      tag: 'Risk & Safety',
      percent: 22,
      border: 'border-taiCoral/40 hover:border-taiCoral',
      bg: 'bg-taiCoral/5 hover:bg-taiCoral/10',
      badge: 'bg-taiCoral/15 text-taiCoral',
    },
    {
      phrase: 'Support Feedback Parsing',
      tag: 'Workflow Integration',
      percent: 18,
      border: 'border-accent/40 hover:border-accent',
      bg: 'bg-accent/5 hover:bg-accent/10',
      badge: 'bg-accent/15 text-accent-dark',
    },
    {
      phrase: 'Multi-Language Translation',
      tag: 'Tool Fluency',
      percent: 16,
      border: 'border-borderCustom hover:border-ink/40',
      bg: 'bg-surface-raised hover:bg-surface',
      badge: 'bg-surface border border-borderCustom text-ink-muted',
    },
    {
      phrase: 'Vendor Invoice Extraction',
      tag: 'Admin Automation',
      percent: 16,
      border: 'border-borderCustom hover:border-ink/40',
      bg: 'bg-surface-raised hover:bg-surface',
      badge: 'bg-surface border border-borderCustom text-ink-muted',
    },
  ];

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const pageIndex = Math.min(currentPage, totalPages);
  const startIdx = (pageIndex - 1) * itemsPerPage;
  const pageItems = filteredItems.slice(startIdx, startIdx + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTopicClick = (keyword: string) => {
    const word = keyword.split(' ')[0] || '';
    setSearchTerm(word);
    setViewMode('quotes');
    setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 bg-surface border border-borderCustom rounded-lg space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-borderCustom/60">
        <div>
          <span className="data-label block text-accent-dark">Qualitative Feedback Synthesis</span>
          <h3 className="font-serif font-semibold text-ink text-lg sm:text-xl">
            Team Task Automation Demand
          </h3>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="p-1 bg-surface-raised border border-borderCustom rounded-lg flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cloud')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              viewMode === 'cloud'
                ? 'bg-accent text-white font-semibold shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            ☁️ Topic Cloud
          </button>
          <button
            type="button"
            onClick={() => setViewMode('quotes')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              viewMode === 'quotes'
                ? 'bg-accent text-white font-semibold shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            💬 Quotes ({items.length})
          </button>
        </div>
      </div>

      {/* Mode 1: Topic & Key Phrase Cloud Grid */}
      {viewMode === 'cloud' && (
        <div className="space-y-4 pt-1 fade-in-quiet">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono text-ink-muted">
            <span>Extracted Key Phrases & Sentiment Intent Tags</span>
            <span className="text-[11px] text-accent font-medium">Click any topic card to filter quotes →</span>
          </div>

          {/* Grid of Clean Structured Topic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topicPillData.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTopicClick(topic.phrase)}
                className={`p-4 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between space-y-3 cursor-pointer ${topic.border} ${topic.bg}`}
              >
                {/* Header row: Title + Sentiment Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-sans font-semibold text-xs sm:text-sm text-ink leading-snug">
                    {topic.phrase}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase whitespace-nowrap flex-shrink-0 ${topic.badge}`}
                  >
                    {topic.tag}
                  </span>
                </div>

                {/* Progress track & metric */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[11px] font-mono text-ink-muted">
                    <span>Demand Share</span>
                    <span className="font-semibold text-ink">{topic.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-borderCustom/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${topic.percent}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3.5 bg-surface-raised border border-borderCustom/70 rounded-lg text-xs text-ink-muted flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>💡 <strong>Executive Synthesis:</strong> Highest frequency automation demand targets Jira ticket creation, contract safety checking, and feedback triage.</span>
            <button
              onClick={() => setViewMode('quotes')}
              className="text-accent font-mono text-xs font-semibold underline underline-offset-2 hover:text-accent-dark flex-shrink-0"
            >
              View raw quotes →
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Searchable & Paginated Individual Quotes */}
      {viewMode === 'quotes' && (
        <div className="space-y-4 fade-in-quiet">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search wishlist items..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-raised border border-borderCustom rounded text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              />
              <span className="absolute left-2.5 top-1.5 text-xs text-ink-muted">🔍</span>
            </div>

            <div className="flex items-center gap-2">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-xs font-mono text-taiCoral hover:underline font-semibold"
                >
                  Clear search
                </button>
              )}
              <span className="text-[11px] font-mono text-ink-muted">
                Showing {pageItems.length > 0 ? startIdx + 1 : 0}–{Math.min(startIdx + itemsPerPage, filteredItems.length)} of {filteredItems.length} submissions
              </span>
            </div>
          </div>

          {/* Wishlist Items Grid */}
          {pageItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {pageItems.map((text, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-surface-raised border border-borderCustom rounded-lg text-xs sm:text-sm text-ink italic leading-relaxed hover:border-accent/40 transition-colors"
                >
                  &ldquo;{text}&rdquo;
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-raised border border-borderCustom rounded-lg text-xs font-mono text-ink-muted">
              No wishlist items match &ldquo;{searchTerm}&rdquo;
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-borderCustom/60 text-xs font-mono">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pageIndex === 1}
                className="px-3 py-1 bg-surface-raised border border-borderCustom rounded text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors font-semibold"
              >
                ← Previous
              </button>

              <span className="text-ink-muted font-medium">
                Page {pageIndex} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex === totalPages}
                className="px-3 py-1 bg-surface-raised border border-borderCustom rounded text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors font-semibold"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
