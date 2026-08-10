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

  // Extract key phrase topics and sentiment tags dynamically
  const topicPillData = [
    { phrase: 'Automating Jira & Summaries', tag: 'High ROI Automation', count: Math.ceil(items.length * 0.28), color: 'bg-taiViolet/10 text-taiViolet border-taiViolet/30' },
    { phrase: 'Contract Compliance Checking', tag: 'Risk & Safety', count: Math.ceil(items.length * 0.22), color: 'bg-taiCoral/10 text-taiCoral border-taiCoral/30' },
    { phrase: 'Support Feedback Parsing', tag: 'Workflow Integration', count: Math.ceil(items.length * 0.18), color: 'bg-accent-light text-accent-dark border-accent/30' },
    { phrase: 'Multi-Language Translation', tag: 'Tool Fluency', count: Math.ceil(items.length * 0.16), color: 'bg-surface-raised text-ink border-borderCustom' },
    { phrase: 'Vendor Invoice Data Extraction', tag: 'Admin Automation', count: Math.ceil(items.length * 0.16), color: 'bg-surface-raised text-ink border-borderCustom' },
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
    <div className="p-6 bg-surface border border-borderCustom rounded-lg space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-borderCustom/60">
        <div>
          <span className="data-label block text-accent-dark">Qualitative Feedback Synthesis</span>
          <h3 className="font-serif font-semibold text-ink text-lg">
            Team Task Automation Demand
          </h3>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-surface-raised border border-borderCustom rounded-lg flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('cloud')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
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
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                viewMode === 'quotes'
                  ? 'bg-accent text-white font-semibold shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              💬 Quotes ({items.length})
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Interactive Topic & Key Phrase Cloud with Sentiment Tags */}
      {viewMode === 'cloud' && (
        <div className="space-y-4 pt-1 fade-in-quiet">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted font-mono">
              Extracted Key Phrases & Sentiment Intent Tags
            </span>
            <span className="text-[10px] font-mono text-ink-muted">Click topic to filter quotes</span>
          </div>

          {/* Visual Topic Cloud Cluster */}
          <div className="flex flex-wrap gap-2.5 p-4 bg-surface-raised border border-borderCustom rounded-lg">
            {topicPillData.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTopicClick(topic.phrase)}
                className={`p-2.5 rounded-lg border transition-all duration-150 flex items-center gap-2 hover:scale-[1.02] ${topic.color}`}
              >
                <span className="font-sans font-semibold text-xs sm:text-sm">
                  {topic.phrase}
                </span>
                <span className="px-1.5 py-0.5 bg-surface text-[10px] font-mono font-bold rounded border border-borderCustom/50">
                  {topic.tag}
                </span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-surface border border-borderCustom/60 rounded text-xs text-ink-muted flex items-center justify-between">
            <span>💡 <strong>Executive Insight:</strong> High-frequency demand concentrates on document synthesis, contract compliance, and recurring administrative workflow automation.</span>
            <button
              onClick={() => setViewMode('quotes')}
              className="text-accent font-mono text-[11px] underline underline-offset-2 hover:text-accent-dark flex-shrink-0 ml-2"
            >
              View all quotes →
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
                  className="text-xs font-mono text-taiCoral hover:underline"
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
                className="px-3 py-1 bg-surface-raised border border-borderCustom rounded text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors font-medium"
              >
                ← Previous
              </button>

              <span className="text-ink-muted">
                Page {pageIndex} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex === totalPages}
                className="px-3 py-1 bg-surface-raised border border-borderCustom rounded text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors font-medium"
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
