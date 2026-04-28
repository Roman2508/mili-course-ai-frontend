import { ArrowRight, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { RecommendationResult } from '@/types/recommendations';

interface RecommendationCardProps {
  recommendation: RecommendationResult;
}

const difficultyLabels = {
  beginner: 'Початковий',
  intermediate: 'Середній',
  advanced: 'Просунутий',
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const similarityPercent = Math.round(recommendation.similarityScore * 100);

  return (
    <Card className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="field">Місце #{recommendation.rank}</Badge>
          <Badge>{difficultyLabels[recommendation.course.difficulty]}</Badge>
          {recommendation.course.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} tone="warning">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">{recommendation.course.title}</h3>
          <p className="text-sm">{recommendation.course.description}</p>
        </div>
        <div className="rounded-2xl bg-field/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-field">
            <BrainCircuit className="size-4" />
            Семантична відповідність
          </div>
          <ProgressBar value={similarityPercent} showLabel={false} />
          <p className="mt-3 text-sm">{recommendation.matchSummary}</p>
        </div>
      </div>

      <div className="rounded-[28px] bg-ink px-5 py-5 text-white">
        <img
          src={recommendation.course.coverImage}
          alt={recommendation.course.title}
          className="h-44 w-full rounded-3xl object-cover"
        />
        <div className="mt-5 space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">Рівень схожості</p>
          <p className="text-4xl font-semibold">{similarityPercent}%</p>
          <p className="text-sm text-white/65">Рекомендація на основі ваших інтересів та результатів навчання.</p>
          <Button variant="secondary" className="mt-2 w-full" asChild>
            <Link className="inline-flex items-center justify-center gap-2" to={`/courses/${recommendation.course.id}`}>
              Відкрити курс
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
