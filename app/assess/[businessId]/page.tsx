'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { QUESTIONS } from '@/lib/questions';
import { normalizeLikert, normalizeMC } from '@/lib/scoring';
import { Business, Answer } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QuestionCard } from '@/components/assessment/QuestionCard';
import { TeamSelect } from '@/components/assessment/TeamSelect';
import { Button } from '@/components/ui/Button';

export default function AssessPage() {
  const params = useParams();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Flow State: 0 = Team Selection, 1 to 10 = Questions, 11 = Done
  const [step, setStep] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, { raw: any; normalized: number }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadBusiness() {
      try {
        const res = await fetch(`/api/business?id=${businessId}`);
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBusiness(data);
        if (data.teams && data.teams.length > 0) {
          setSelectedTeam(data.teams[0]);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (businessId) {
      loadBusiness();
    }
  }, [businessId]);

  if (loading) {
    return (
      <div className="max-w-[560px] mx-auto py-16 space-y-6 animate-pulse">
        <div className="h-4 w-36 bg-borderCustom rounded" />
        <div className="h-8 w-full bg-borderCustom rounded" />
        <div className="h-32 w-full bg-borderCustom rounded-lg" />
      </div>
    );
  }

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
            Return to home
          </Button>
        </div>
      </div>
    );
  }

  const totalSteps = QUESTIONS.length;
  const currentQuestion = step > 0 && step <= totalSteps ? QUESTIONS[step - 1] : null;
  const progressPercent = Math.round((step / (totalSteps + 1)) * 100);

  const handleRecordAnswer = (val: any) => {
    if (!currentQuestion) return;

    let normalizedScore = 0;
    if (currentQuestion.type === 'likert') {
      normalizedScore = normalizeLikert(Number(val));
    } else if (currentQuestion.type === 'multiple_choice' && currentQuestion.options) {
      normalizedScore = normalizeMC(Number(val), currentQuestion.options.length);
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        raw: val,
        normalized: normalizedScore,
      },
    }));
  };

  const handleNextStep = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Submit complete response
      setIsSubmitting(true);

      const formattedAnswers: Answer[] = QUESTIONS.filter((q) => q.type !== 'text_optional').map((q) => {
        const item = answers[q.id] || { raw: 1, normalized: 0 };
        return {
          questionId: q.id,
          value: item.normalized,
          rawAnswer: item.raw,
        };
      });

      const qualitativeWish = typeof answers['q11']?.raw === 'string' ? answers['q11'].raw : undefined;

      try {
        const res = await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            team: selectedTeam,
            answers: formattedAnswers,
            qualitativeWish,
          }),
        });

        if (!res.ok) {
          setError(true);
          return;
        }

        const savedResp = await res.json();
        if (typeof window !== 'undefined' && savedResp && savedResp.id) {
          try {
            const key = `tai_responses_${businessId}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const map = new Map<string, any>();
            if (Array.isArray(existing)) {
              existing.forEach((r: any) => r && r.id && map.set(r.id, r));
            }
            if (savedResp.allResponses && Array.isArray(savedResp.allResponses)) {
              savedResp.allResponses.forEach((r: any) => r && r.id && map.set(r.id, r));
            }
            map.set(savedResp.id, savedResp);
            const mergedList = Array.from(map.values());
            localStorage.setItem(key, JSON.stringify(mergedList));
            window.dispatchEvent(new Event('storage'));
          } catch (e) {
            // localStorage fallback
          }
        }

        setStep(totalSteps + 1); // Move to completion state
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Step 0: Team Selection
  if (step === 0) {
    return (
      <div className="w-full max-w-[560px] mx-auto space-y-8 py-6 sm:py-12 fade-in-quiet">
        <ProgressBar progress={5} />

        <div className="space-y-2 text-center sm:text-left">
          <span className="data-label text-accent-dark">{business.name}</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">
            AI Readiness Team Assessment
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Takes ~2 minutes. Your responses are anonymous and will help identify key upskilling opportunities for your department.
          </p>
        </div>

        <div className="p-6 bg-surface border border-borderCustom rounded-lg space-y-6">
          <TeamSelect
            teams={business.teams}
            selectedTeam={selectedTeam}
            onSelectTeam={(team) => setSelectedTeam(team)}
          />

          <Button
            onClick={() => setStep(1)}
            disabled={!selectedTeam}
            className="w-full py-3"
          >
            Begin Diagnostic →
          </Button>
        </div>
      </div>
    );
  }

  // Completion State (Step 11)
  if (step > totalSteps) {
    return (
      <div className="w-full max-w-[560px] mx-auto text-center space-y-6 py-12 sm:py-20 fade-in-quiet">
        <ProgressBar progress={100} />

        <div className="w-12 h-12 bg-accent-light text-accent border border-accent/20 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>

        <div className="space-y-2">
          <span className="data-label text-accent-dark">{business.name}</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">
            Assessment Recorded
          </h1>
          <p className="text-sm text-ink-muted leading-relaxed max-w-md mx-auto">
            Thank you for contributing to {business.name}&apos;s AI readiness baseline. Your input will shape targeted team upskilling tracks.
          </p>
        </div>

        <div className="pt-4">
          <a
            href={`/dashboard/${businessId}`}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent-dark transition-colors shadow-sm"
          >
            View Business Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Question Steps
  return (
    <div className="py-6 sm:py-12">
      <ProgressBar progress={progressPercent} />
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          currentStep={step}
          totalSteps={totalSteps}
          selectedValue={answers[currentQuestion.id]?.raw ?? null}
          onAnswer={(val) => handleRecordAnswer(val)}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
        />
      )}
    </div>
  );
}
