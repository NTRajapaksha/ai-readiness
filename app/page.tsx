'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TEAMS } from '@/lib/questions';

export default function HomePage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([...TEAMS]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTeam = (team: string) => {
    if (selectedTeams.includes(team)) {
      if (selectedTeams.length === 1) return; // keep at least 1 team
      setSelectedTeams(selectedTeams.filter((t) => t !== team));
    } else {
      setSelectedTeams([...selectedTeams, team]);
    }
  };

  const allSelected = selectedTeams.length === TEAMS.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      // Deselect all, keeping at least 1 team selected
      setSelectedTeams([TEAMS[0]]);
    } else {
      setSelectedTeams([...TEAMS]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName || 'Acme Corporation',
          teams: selectedTeams,
        }),
      });

      const data = await res.json();
      if (data && data.id) {
        router.push(`/dashboard/${data.id}`);
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-6 sm:py-12 fade-in-quiet">
      {/* Brand & Hero Headline */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-light text-accent-dark rounded-full text-xs font-mono font-semibold uppercase">
          Tai Labs Coaching Instrument
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-ink leading-tight">
          Measure team AI readiness with clinical precision
        </h1>
        <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
          Turn AI uncertainty into a clear, team-by-team diagnostic score and targeted upskilling roadmap for your organization.
        </p>
      </div>

      {/* Assessment Creation Form */}
      <Card variant="raised" className="space-y-6">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="data-label block">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              required
              className="w-full p-3 text-sm bg-bg border border-borderCustom rounded text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="data-label">Departments to Assess</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-2.5 py-1 bg-accent/10 border border-accent/30 text-accent-dark hover:bg-accent hover:text-white rounded text-xs font-mono font-semibold transition-all duration-150 shadow-sm flex items-center gap-1 focus-visible:outline-none"
                >
                  <span>{allSelected ? '✓ Deselect all' : '⚡ Select all'}</span>
                </button>
                <span className="text-xs font-mono text-ink-muted">
                  {selectedTeams.length} Selected
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEAMS.map((team) => {
                const isSelected = selectedTeams.includes(team);
                return (
                  <button
                    key={team}
                    type="button"
                    onClick={() => toggleTeam(team)}
                    className={`py-2 px-3 text-xs font-mono rounded border transition-colors flex items-center justify-between focus-visible:outline-none ${
                      isSelected
                        ? 'bg-accent text-white border-accent font-semibold'
                        : 'bg-surface border-borderCustom text-ink-muted hover:text-ink'
                    }`}
                  >
                    <span>{team}</span>
                    <span className="text-[10px] ml-1">{isSelected ? '✓' : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
            {isSubmitting ? 'Initializing Diagnostic...' : 'Create Assessment Link'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
