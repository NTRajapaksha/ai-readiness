'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Business, AssessmentResponse, Recommendation } from '@/types';
import {
  calculateDimensionScores,
  calculateOverallScore,
  calculateTeamScores,
} from '@/lib/scoring';
import { generateRecommendations } from '@/lib/recommendations';
import { ENABLE_DEMO_MODE } from '@/lib/demoData';

import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { RadarChart } from '@/components/ui/RadarChart';
import { BarChart } from '@/components/ui/BarChart';
import { ExecutiveBrief } from '@/components/ui/ExecutiveBrief';
import { RecommendationCard } from '@/components/ui/RecommendationCard';
import { PlaybookDrawer } from '@/components/ui/PlaybookDrawer';
import { QualitativeWall } from '@/components/ui/QualitativeWall';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isInjectingDemo, setIsInjectingDemo] = useState(false);

  // Upgrades State: Filter Pills & Playbook Drawer
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | string>('all');
  const [activePlaybookRec, setActivePlaybookRec] = useState<Recommendation | null>(null);

  async function loadDashboardData() {
    try {
      const [busRes, respRes] = await Promise.all([
        fetch(`/api/business?id=${businessId}`, { cache: 'no-store' }),
        fetch(`/api/responses?businessId=${businessId}`, { cache: 'no-store' }),
      ]);

      if (!busRes.ok) {
        setError(true);
        setLoading(false);
        return;
      }

      const busData = await busRes.json();
      const respData = await respRes.json();

      setBusiness(busData);

      let serverList: AssessmentResponse[] = [];
      if (Array.isArray(respData)) {
        serverList = respData;
      }

      let localList: AssessmentResponse[] = [];
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(`tai_responses_${businessId}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localList = parsed;
          }
        } catch (e) {}
      }

      const map = new Map<string, AssessmentResponse>();
      [...serverList, ...localList].forEach((item) => {
        if (item && item.id && Array.isArray(item.answers)) {
          map.set(item.id, item);
        }
      });

      setResponses(Array.from(map.values()));
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (businessId) {
      loadDashboardData();
    }
  }, [businessId]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/assess/${businessId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInjectDemoData = async () => {
    if (isInjectingDemo) return;
    setIsInjectingDemo(true);
    try {
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action: 'inject_demo',
          teams: business?.teams,
        }),
      });

      const data = await res.json();
      if (data && data.responses && Array.isArray(data.responses)) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`tai_responses_${businessId}`, JSON.stringify(data.responses));
          } catch (e) {}
        }
      }
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsInjectingDemo(false);
    }
  };

  const handleExportReport = () => {
    window.print();
  };

  // State 1: Loading
  if (loading) {
    return <DashboardSkeleton />;
  }

  // State 2: Error
  if (error || !business) {
    return (
      <div className="max-w-[560px] mx-auto py-16 text-center space-y-4 fade-in-quiet">
        <h1 className="text-xl font-serif font-semibold text-ink">
          We couldn't find this assessment.
        </h1>
        <p className="text-sm text-ink-muted">
          Double check the link, or start a new assessment for your organization.
        </p>
        <div className="pt-2">
          <Button variant="secondary" onClick={() => (window.location.href = '/')}>
            Start a new assessment
          </Button>
        </div>
      </div>
    );
  }

  const assessmentUrl = typeof window !== 'undefined' ? `${window.location.origin}/assess/${businessId}` : `/assess/${businessId}`;
  const totalResponses = responses.length;

  // State 3: Empty (no responses yet)
  if (totalResponses === 0) {
    return (
      <div className="space-y-8 fade-in-quiet">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-borderCustom">
          <div>
            <span className="data-label text-accent-dark">Executive Dashboard</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">
              {business.name}
            </h1>
          </div>
          <span className="px-3 py-1 bg-surface border border-borderCustom rounded font-mono text-xs text-ink-muted">
            0 Team Responses
          </span>
        </div>

        {/* Empty State Card */}
        <div className="max-w-xl mx-auto p-8 bg-surface border border-borderCustom rounded-lg text-center space-y-6">
          <div className="w-12 h-12 bg-accent-light text-accent rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            🔗
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-serif font-semibold text-ink">
              No responses yet
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Share this shareable link with your department team members to begin collecting AI readiness signals.
            </p>
          </div>

          {/* Copyable Share Link Input */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <input
              type="text"
              readOnly
              value={assessmentUrl}
              className="w-full p-2.5 text-xs font-mono bg-surface-raised border border-borderCustom rounded text-ink focus-visible:outline-none"
            />
            <Button
              onClick={handleCopyLink}
              variant="primary"
              className="w-full sm:w-auto text-xs whitespace-nowrap py-2.5 px-4"
            >
              {copied ? 'Copied to clipboard' : 'Copy link'}
            </Button>
          </div>

          {/* Easily Removable Instant Demo Mode Loader */}
          {ENABLE_DEMO_MODE && (
            <div className="pt-6 border-t border-borderCustom/60">
              <div className="p-4 bg-surface-raised border border-borderCustom rounded text-left space-y-2">
                <div className="flex justify-between items-center">
                  <span className="data-label text-accent">Reviewer Shortcut</span>
                  <span className="text-[10px] font-mono text-ink-muted">Optional</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Instantly populates a realistic 11-member benchmark dataset distributed across your organization&apos;s configured departments ({business.teams.join(', ')}) so you can evaluate the full analytics dashboard, 5-dimension radar chart, team breakdown, and recommendation engine immediately.
                </p>
                <Button
                  onClick={handleInjectDemoData}
                  disabled={isInjectingDemo}
                  variant="secondary"
                  className="w-full text-xs py-2 mt-1"
                >
                  {isInjectingDemo ? 'Loading sample data...' : 'Populate with Sample Team Data'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // State 4: Done (Populated with responses)
  const safeResponses = Array.isArray(responses) ? responses : [];
  const dimensionScores = calculateDimensionScores(safeResponses);
  const overallScore = calculateOverallScore(dimensionScores);
  const teamScores = calculateTeamScores(safeResponses, business?.teams || []);

  const responsesByTeam: Record<string, number> = {};
  safeResponses.forEach((r) => {
    if (r && r.team) {
      responsesByTeam[r.team] = (responsesByTeam[r.team] || 0) + 1;
    }
  });

  const allRecommendations = generateRecommendations(dimensionScores, teamScores) || [];
  const qualitativeFeedback = Array.from(
    new Set(
      safeResponses
        .map((r) => r?.qualitativeWish)
        .filter((w): w is string => Boolean(w && w.trim().length > 0))
    )
  );

  // Filter Logic
  const filteredRecommendations = allRecommendations.filter((rec) => {
    if (!rec) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high') return rec.priority === 'high';
    return rec.targetTeam === selectedFilter;
  });

  const availableTeamFilters = Array.from(
    new Set(allRecommendations.map((r) => r?.targetTeam).filter((t): t is string => Boolean(t)))
  );

  return (
    <div className="space-y-8 fade-in-quiet">
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-borderCustom">
        <div>
          <span className="data-label text-accent-dark">Diagnostic Results</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">
            {business.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto no-print">
          <button
            onClick={handleExportReport}
            className="px-3 py-1.5 bg-surface-raised border border-borderCustom rounded-md text-xs font-mono font-semibold text-ink hover:bg-surface hover:border-ink/40 transition-all duration-150 flex items-center gap-1.5 shadow-sm focus-visible:outline-none"
          >
            <span>🖨️</span> Export Report
          </button>

          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all duration-150 flex items-center gap-1.5 shadow-sm border focus-visible:outline-none ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-accent text-white border-accent hover:bg-accent-dark'
            }`}
          >
            <span>{copied ? '✓' : '🔗'}</span>
            <span>{copied ? 'Link copied!' : 'Copy survey link'}</span>
          </button>

          <span className="px-3 py-1.5 bg-surface border border-borderCustom/80 rounded-md font-mono text-xs font-semibold text-ink shadow-sm">
            {totalResponses} {totalResponses === 1 ? 'Response' : 'Responses'}
          </span>
        </div>
      </div>

      {/* Hero Analytics Row (Score Gauge + Radar & Bar Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Top-Left Signature Score Gauge */}
        <ScoreGauge score={overallScore} totalResponses={totalResponses} />

        {/* Center Radar Chart */}
        <RadarChart dimensionScores={dimensionScores} />

        {/* Right Bar Chart (Team Breakdown) */}
        <BarChart teamScores={teamScores} responsesByTeam={responsesByTeam} />
      </div>

      {/* LLM Strategic Interpretation & Synthesis Brief */}
      <div className="pt-2">
        <ExecutiveBrief
          businessName={business.name}
          overallScore={overallScore}
          dimensionScores={dimensionScores}
          teamScores={teamScores}
          qualitativeWishes={qualitativeFeedback}
        />
      </div>

      {/* Actionable Upskilling Recommendations Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="data-label block">Coaching Plan</span>
            <h2 className="text-xl font-serif font-semibold text-ink">
              Recommended Upskilling Roadmap
            </h2>
          </div>

          {/* Upgrade #2: Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 no-print">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-accent text-white border-accent font-semibold'
                  : 'bg-surface border-borderCustom text-ink-muted hover:text-ink'
              }`}
            >
              All ({allRecommendations.length})
            </button>
            <button
              onClick={() => setSelectedFilter('high')}
              className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                selectedFilter === 'high'
                  ? 'bg-accent text-white border-accent font-semibold'
                  : 'bg-surface border-borderCustom text-ink-muted hover:text-ink'
              }`}
            >
              High Priority ({allRecommendations.filter((r) => r.priority === 'high').length})
            </button>
            {availableTeamFilters.map((team) => (
              <button
                key={team}
                onClick={() => setSelectedFilter(team as string)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
                  selectedFilter === team
                    ? 'bg-accent text-white border-accent font-semibold'
                    : 'bg-surface border-borderCustom text-ink-muted hover:text-ink'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Cards */}
        <div className="space-y-3">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onClick={() => setActivePlaybookRec(rec)}
            />
          ))}
        </div>
      </div>

      {/* Qualitative Team Feedback Wall */}
      {qualitativeFeedback.length > 0 && (
        <div className="pt-4">
          <QualitativeWall items={qualitativeFeedback} />
        </div>
      )}

      {/* Upgrade #1: Interactive Playbook Drawer */}
      <PlaybookDrawer
        recommendation={activePlaybookRec}
        onClose={() => setActivePlaybookRec(null)}
      />
    </div>
  );
}
