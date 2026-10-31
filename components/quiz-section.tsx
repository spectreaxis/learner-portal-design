'use client';

import { useState, memo, useMemo, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Sparkles, Loader2, Award } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { QuizQuestion, SavedQuizResult } from '@/lib/types';
import { saveQuizProgress, getQuizProgress, clearQuizProgress } from '@/lib/storage';
import { useSubmitQuiz } from '@/lib/hooks/useLearner';

interface QuizSectionProps {
  title: string;
  questions: QuizQuestion[];
  quizId: string;
  /** Certification mode: no per-question feedback, 80% pass mark */
  isAssessment?: boolean;
  /** Shown on the results screen once the quiz is passed, e.g. go to the next lesson */
  continueAction?: { label: string; onClick: () => void };
  /** Shown on the results screen when the quiz is failed, to revisit the lesson */
  onReview?: () => void;
  /** The learner's last submission, shown again instead of a blank quiz */
  savedResult?: SavedQuizResult;
  /** Certificate already earned for this assessment, linked from a saved passing result */
  savedCertificate?: { certificateId: string };
  onComplete?: (score: number, maxScore: number, certificate?: any) => void;
}

export const QuizSection = memo(function QuizSection({ title, questions, quizId, isAssessment = false, continueAction, onReview, savedResult, savedCertificate, onComplete }: QuizSectionProps) {
  const submitQuizMutation = useSubmitQuiz();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  // Drafts are per learner and per quiz: titles repeat across modules and a browser may be shared
  const draftKey = userId ? `${userId}:${quizId}` : null;
  const initializedRef = useRef(false);
  const [viewingSavedResult, setViewingSavedResult] = useState(false);
  const [earnedCertificate, setEarnedCertificate] = useState<any>(null);
  // Assessments have no answer key on the client, so their score comes from the server
  const [serverResult, setServerResult] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  // Memoize score calculation
  const score = useMemo(() =>
    questions.filter(q =>
      selectedAnswers[q.id]?.toLowerCase() === q.answer?.toLowerCase()
    ).length,
    [questions, selectedAnswers]
  );

  // Restore once the learner is known: resume an unfinished attempt if it is newer than
  // the last submission, otherwise show the last submitted result
  useEffect(() => {
    if (initializedRef.current || !draftKey) return;
    initializedRef.current = true;

    const draft = getQuizProgress()[draftKey];
    const draftHasAnswers = !!draft && Object.keys(draft.selectedAnswers ?? {}).length > 0;
    const savedAt = savedResult ? new Date(savedResult.submittedAt).getTime() : 0;

    if (draftHasAnswers && (draft.updatedAt ?? 0) > savedAt) {
      setSelectedAnswers(draft.selectedAnswers);
      setSubmitted(draft.submitted ?? {});
      setCurrentQuestion(Math.min(draft.currentQuestion ?? 0, questions.length - 1));
    } else if (savedResult) {
      setSelectedAnswers(savedResult.answers ?? {});
      setSubmitted(Object.fromEntries(questions.map((q) => [q.id, true])));
      setServerResult({ score: savedResult.score, maxScore: savedResult.maxScore, passed: savedResult.passed });
      setShowResults(true);
      setViewingSavedResult(true);
    }
  }, [draftKey, savedResult, questions]);

  // Save the unfinished attempt so leaving the page doesn't lose it
  useEffect(() => {
    if (!initializedRef.current || !draftKey || showResults) return;
    if (Object.keys(selectedAnswers).length === 0) return;
    saveQuizProgress(draftKey, { selectedAnswers, submitted, score, currentQuestion, updatedAt: Date.now() });
  }, [selectedAnswers, submitted, score, currentQuestion, showResults, draftKey]);

  const question = questions[currentQuestion];
  // In an assessment answers are never revealed, so a question is never "answered" in the feedback sense
  const isAnswered = !isAssessment && submitted[question.id];
  const isCorrect = selectedAnswers[question.id]?.toLowerCase() === question.answer?.toLowerCase();

  const handleSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswers(prev => ({ ...prev, [question.id]: answer }));
  };

  const handleSubmit = () => {
    if (!selectedAnswers[question.id]) return;
    setSubmitted(prev => ({ ...prev, [question.id]: true }));
  };

  const handleNext = async () => {
    if (isAssessment && !selectedAnswers[question.id]) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);

      // Submit to backend
      try {
        const result = await submitQuizMutation.mutateAsync({
          quizId,
          answers: selectedAnswers
        });

        // Submitted: the server now holds this attempt, so the draft is no longer needed
        if (draftKey) clearQuizProgress(draftKey);

        if (result.submission) {
          setServerResult({
            score: result.submission.score,
            maxScore: result.submission.maxScore,
            passed: result.submission.passed,
          });
        }

        // Check if certificate was earned
        if (result.certificate) {
          setEarnedCertificate(result.certificate);
          onComplete?.(score, questions.length, result.certificate);
        } else {
          onComplete?.(score, questions.length);
        }
      } catch (error) {
        console.error('Failed to submit quiz:', error);
        // Still show results locally even if backend fails
        onComplete?.(score, questions.length);
      }
    }
  };

  const handleReset = () => {
    if (draftKey) clearQuizProgress(draftKey);
    setViewingSavedResult(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setSubmitted({});
    setEarnedCertificate(null);
    setServerResult(null);
  };

  if (showResults) {
    const finalScore = serverResult?.score ?? (isAssessment ? 0 : score);
    const maxScore = serverResult?.maxScore ?? questions.length;
    const certificateToShow = earnedCertificate ?? (viewingSavedResult && serverResult?.passed ? savedCertificate : null);
    const percentage = Math.round((finalScore / maxScore) * 100);
    // The server's verdict decides progression; fall back to the local score if it is unavailable
    const passed = serverResult ? serverResult.passed : percentage >= 70;

    return (
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-6">{title}: Results</h3>

        {submitQuizMutation.isPending ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Submitting your quiz...</p>
          </div>
        ) : isAssessment && !serverResult ? (
          <div className="text-center py-8">
            <XCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-6">
              We couldn&apos;t submit your assessment. Please check your connection and try again.
            </p>
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Submission
            </button>
          </div>
        ) : (
          <>
            <div className="text-center py-8">
              <div className={cn(
                'w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center',
                passed ? 'bg-success/10' : 'bg-destructive/10'
              )}>
                {passed ? (
                  <CheckCircle2 className="w-10 h-10 text-success" />
                ) : (
                  <XCircle className="w-10 h-10 text-destructive" />
                )}
              </div>

              <p className="text-4xl font-bold text-foreground mb-2">
                {finalScore} / {maxScore}
              </p>
              <p className={cn(
                'text-sm font-medium',
                passed ? 'text-success' : 'text-destructive'
              )}>
                {isAssessment
                  ? passed ? 'Passed! You earned your certificate.' : 'Not passed. You need at least 80%.'
                  : passed ? 'Great job!' : 'Keep practicing!'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {percentage}% correct
              </p>
              {viewingSavedResult && savedResult && (
                <p className="text-xs text-muted-foreground mt-2">
                  Your last attempt · {new Date(savedResult.submittedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* Answer review: self-check quizzes only, the assessment's answer key stays on the server */}
            {!isAssessment && (
              <ul className="mb-6 space-y-2">
                {questions.map((q, i) => {
                  const answer = selectedAnswers[q.id];
                  const correct = answer?.toLowerCase() === q.answer?.toLowerCase();
                  const answerText = (label?: string) =>
                    q.options?.find((o) => o.label === label)?.text ?? label ?? '—';
                  return (
                    <li key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                      {correct ? (
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0 text-sm">
                        <p className="font-medium text-foreground">{i + 1}. {q.question}</p>
                        <p className="text-muted-foreground">Your answer: {answerText(answer)}</p>
                        {!correct && (
                          <p className="text-muted-foreground">Correct answer: {answerText(q.answer)}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {certificateToShow && (
              <div className="mb-4 p-4 rounded-xl bg-success/5 border border-success/20 text-center">
                <p className="text-xs text-muted-foreground mb-1">Certificate ID</p>
                <p className="font-mono text-sm font-semibold text-foreground mb-3">
                  {certificateToShow.certificateId}
                </p>
                <Link
                  href={`/certificate/${certificateToShow.certificateId}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <Award className="w-4 h-4" />
                  View Certificate
                </Link>
              </div>
            )}

            <div className="space-y-3">
              {passed && continueAction && (
                <button
                  onClick={continueAction.onClick}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {continueAction.label}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {!passed && !isAssessment && (
                <p className="text-sm text-center text-muted-foreground">
                  You need at least 70% to continue. Review the lesson, then try again.
                </p>
              )}
              <div className="flex gap-3">
                {!passed && onReview && (
                  <button
                    onClick={onReview}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-muted transition-colors"
                  >
                    Review Lesson
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors',
                    passed
                      ? 'bg-muted text-foreground hover:bg-muted/80'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                  {passed ? (isAssessment ? 'Retake Assessment' : 'Retake Quiz') : 'Try Again'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <span className="text-sm text-muted-foreground px-3 py-1 rounded-lg bg-muted/50">
          {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < currentQuestion
                ? isAssessment
                  ? 'bg-primary/60'
                  : selectedAnswers[q.id]?.toLowerCase() === q.answer?.toLowerCase()
                  ? 'bg-success'
                  : 'bg-destructive'
                : i === currentQuestion
                ? 'bg-primary'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Question */}
      <p className="text-foreground font-medium mb-6 text-balance text-lg">{question.question}</p>

      {/* Options */}
      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-3 mb-6">
          {question.options.map((option) => {
            const isSelected = selectedAnswers[question.id] === option.label;
            const showCorrect = isAnswered && option.label === question.answer;
            const showIncorrect = isAnswered && isSelected && !isCorrect;

            return (
              <button
                key={option.label}
                onClick={() => handleSelect(option.label)}
                disabled={isAnswered}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                  showCorrect
                    ? 'bg-success/5 border-success/50'
                    : showIncorrect
                    ? 'bg-destructive/5 border-destructive/50'
                    : isSelected
                    ? 'bg-primary/5 border-primary/50'
                    : 'bg-muted/30 border-border hover:border-primary/30 hover:bg-muted/50'
                )}
              >
                <span className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors',
                  showCorrect
                    ? 'bg-success text-success-foreground'
                    : showIncorrect
                    ? 'bg-destructive text-destructive-foreground'
                    : isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {option.label}
                </span>
                <span className={cn(
                  'text-sm',
                  showCorrect ? 'text-success font-medium' : showIncorrect ? 'text-destructive' : 'text-foreground'
                )}>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* True/False */}
      {question.type === 'true-false' && (
        <div className="flex gap-3 mb-6">
          {['True', 'False'].map((option, index) => {
            const isSelected = selectedAnswers[question.id] === option;
            const showCorrect = isAnswered && option === question.answer;
            const showIncorrect = isAnswered && isSelected && selectedAnswers[question.id] !== question.answer;

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                className={cn(
                  'flex-1 flex items-center justify-center gap-3 py-4 rounded-xl border font-medium transition-all',
                  showCorrect
                    ? 'bg-success/5 border-success/50 text-success'
                    : showIncorrect
                    ? 'bg-destructive/5 border-destructive/50 text-destructive'
                    : isSelected
                    ? 'bg-primary/5 border-primary/50 text-primary'
                    : 'bg-muted/30 border-border text-foreground hover:border-primary/30 hover:bg-muted/50'
                )}
              >
                {/* Letter badge matches the multiple-choice options */}
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold bg-muted text-muted-foreground">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation */}
      {isAnswered && question.explanation && (
        <div className={cn(
          'p-4 rounded-xl mb-6 border',
          isCorrect ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
        )}>
          <p className={cn(
            'text-sm font-semibold mb-1',
            isCorrect ? 'text-success' : 'text-warning'
          )}>
            {isCorrect ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {isAssessment ? (
          <button
            onClick={handleNext}
            disabled={!selectedAnswers[question.id]}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
              selectedAnswers[question.id]
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Assessment'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : !isAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswers[question.id]}
            className={cn(
              'flex-1 py-3 rounded-xl font-medium transition-all',
              selectedAnswers[question.id]
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm font-medium"
          >
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});
