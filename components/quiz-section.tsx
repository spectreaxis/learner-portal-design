'use client';

import { useState, memo, useMemo, useEffect } from 'react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizQuestion } from '@/lib/types';
import { saveQuizProgress, getQuizProgress } from '@/lib/storage';

interface QuizSectionProps {
  title: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, maxScore: number) => void;
}

export const QuizSection = memo(function QuizSection({ title, questions, onComplete }: QuizSectionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  // Memoize score calculation
  const score = useMemo(() =>
    questions.filter(q =>
      selectedAnswers[q.id]?.toLowerCase() === q.answer.toLowerCase()
    ).length,
    [questions, selectedAnswers]
  );

  // Load from storage on mount
  useEffect(() => {
    const saved = getQuizProgress()[title];
    if (saved) {
      setSelectedAnswers(saved.selectedAnswers);
      setSubmitted(saved.submitted);
    }
  }, [title]);

  // Save on change
  useEffect(() => {
    saveQuizProgress(title, { selectedAnswers, submitted, score });
  }, [selectedAnswers, submitted, score, title]);

  const question = questions[currentQuestion];
  const isAnswered = submitted[question.id];
  const isCorrect = selectedAnswers[question.id]?.toLowerCase() === question.answer.toLowerCase();

  const handleSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswers(prev => ({ ...prev, [question.id]: answer }));
  };

  const handleSubmit = () => {
    if (!selectedAnswers[question.id]) return;
    setSubmitted(prev => ({ ...prev, [question.id]: true }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
      onComplete?.(score, questions.length);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setSubmitted({});
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-6">{title} — Results</h3>
        
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
            {score} / {questions.length}
          </p>
          <p className={cn(
            'text-sm font-medium',
            passed ? 'text-success' : 'text-destructive'
          )}>
            {passed ? 'Great job!' : 'Keep practicing!'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {percentage}% correct
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
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
                ? selectedAnswers[q.id]?.toLowerCase() === q.answer.toLowerCase()
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
          {['True', 'False'].map((option) => {
            const isSelected = selectedAnswers[question.id] === option;
            const showCorrect = isAnswered && option === question.answer;
            const showIncorrect = isAnswered && isSelected && selectedAnswers[question.id] !== question.answer;

            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                disabled={isAnswered}
                className={cn(
                  'flex-1 py-4 rounded-xl border font-medium transition-all',
                  showCorrect
                    ? 'bg-success/5 border-success/50 text-success'
                    : showIncorrect
                    ? 'bg-destructive/5 border-destructive/50 text-destructive'
                    : isSelected
                    ? 'bg-primary/5 border-primary/50 text-primary'
                    : 'bg-muted/30 border-border text-foreground hover:border-primary/30 hover:bg-muted/50'
                )}
              >
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
        {!isAnswered ? (
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
