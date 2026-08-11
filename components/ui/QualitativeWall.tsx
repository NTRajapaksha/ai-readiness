'use client';

import React, { useState } from 'react';
import { extractDynamicTopics, DynamicTopic } from '@/lib/clustering';

interface QualitativeWallProps {
  items: string[];
}

export const QualitativeWall: React.FC<QualitativeWallProps> = ({ items }) => {
  const [viewMode, setViewMode] = useState<'cloud' | 'quotes'>('cloud');
  const [selectedTopic, setSelectedTopic] = useState<DynamicTopic | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  if (!items || !Array.isArray(items) || items.length === 0) return null;

  // Dynamically extract topic categories and demand share percentages from actual user inputs
  const dynamicTopics = extractDynamicTopics(items);

  const baseItems = selectedTopic ? selectedTopic.matchedItems : items;

  const filteredItems = baseItems.filter((item) =>
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

  const handleTopicClick = (topic: DynamicTopic) => {
    setSelectedTopic(topic);
    setSearchTerm('');
    setViewMode('quotes');
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedTopic(null);
    setSearchTerm('');
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
            Topic Cloud
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
            Quotes ({items.length})
          </button>
        </div>
      </div>

      {/* Mode 1: Dynamic Topic & Key Phrase Cloud Grid */}
      {viewMode === 'cloud' && (
        <div className="space-y-4 pt-1 fade-in-quiet">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono text-ink-muted">
            <span>Automated Key Phrase Extraction & Sentiment Intent Tags ({dynamicTopics.length} Categories)</span>
            <span className="text-[11px] text-accent font-medium">Click any topic card to filter quotes →</span>
          </div>

          {/* Grid of Clean Structured Topic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dynamicTopics.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTopicClick(topic)}
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
                    <span>Demand Share ({topic.count} {topic.count === 1 ? 'request' : 'requests'})</span>
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


        </div>
      )}

      {/* Mode 2: Searchable & Paginated Individual Quotes */}
      {viewMode === 'quotes' && (
        <div className="space-y-4 fade-in-quiet">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search wishlist items..."
                  className="w-full pl-8 pr-3 py-1.5 bg-surface-raised border border-borderCustom rounded text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                />
                <svg className="w-3.5 h-3.5 absolute left-2.5 top-2 text-ink-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {selectedTopic && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/30 text-accent-dark text-xs rounded font-mono font-medium">
                  <span>Topic: {selectedTopic.phrase} ({selectedTopic.count})</span>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="ml-1 hover:text-taiCoral font-bold text-sm"
                    title="Clear topic filter"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(searchTerm || selectedTopic) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-mono text-taiCoral hover:underline font-semibold"
                >
                  Clear all filters
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
