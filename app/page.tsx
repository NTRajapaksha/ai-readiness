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
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`tai_business_${data.id}`, JSON.stringify(data));
          } catch (e) {}
        }
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
    <div className="max-w-2xl md:max-w-3xl mx-auto space-y-10 py-8 sm:py-16 fade-in-quiet">
      {/* Brand & Hero Headline */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent-light text-accent-dark rounded-full text-xs sm:text-sm font-mono font-semibold uppercase">
          Tai Labs Coaching Instrument
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-ink leading-tight">
          Measure team AI readiness with clinical precision
        </h1>
        <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
          Turn AI uncertainty into a clear, team-by-team diagnostic score and targeted upskilling roadmap for your organization.
        </p>
      </div>

      {/* Assessment Creation Form */}
      <Card variant="raised" className="space-y-6 sm:p-8">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="data-label block">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              required
              className="w-full p-3.5 sm:p-4 text-sm sm:text-base bg-bg border border-borderCustom rounded text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="data-label">Departments to Assess</label>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs sm:text-sm font-mono text-accent hover:underline font-semibold"
              >
                {allSelected ? '✓ Deselect all' : '+ Select all'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TEAMS.map((team) => {
                const isSelected = selectedTeams.includes(team);
                return (
                  <button
                    key={team}
                    type="button"
                    onClick={() => toggleTeam(team)}
                    className={`px-3.5 py-2.5 sm:py-3 rounded text-xs sm:text-sm font-mono font-medium transition-all duration-150 flex items-center justify-between border ${
                      isSelected
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'bg-bg text-ink-muted border-borderCustom hover:border-ink/40'
                    }`}
                  >
                    <span>{team}</span>
                    {isSelected && <span className="text-[11px] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] sm:text-xs text-ink-muted font-mono block text-right">
              {selectedTeams.length} Selected
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3.5 sm:py-4 text-sm sm:text-base"
            disabled={isSubmitting || selectedTeams.length === 0}
          >
            {isSubmitting ? 'Creating Link...' : 'Create Assessment Link'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
