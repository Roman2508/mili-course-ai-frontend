import { ArrowLeft, ArrowRight, CheckCircle2, MonitorPlay } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { CourseLesson } from '@/types/course';

interface LessonContentProps {
  lesson: CourseLesson;
  previousHref?: string;
  nextHref?: string;
  isCompleted: boolean;
  isSaving: boolean;
  onMarkCompleted: () => void;
}

export function LessonContent({
  lesson,
  previousHref,
  nextHref,
  isCompleted,
  isSaving,
  onMarkCompleted,
}: LessonContentProps) {
  return (
    <Card className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate">
          {lesson.contentType === 'video' ? 'відеоурок' : 'текстовий урок'}
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold">{lesson.title}</h1>
          <p className="text-sm">{lesson.summary}</p>
        </div>
      </div>

      {lesson.contentType === 'video' && lesson.videoUrl ? (
        <div className="overflow-hidden rounded-[28px] bg-ink">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-sm text-white/70">
            <MonitorPlay className="size-4" />
            Відеоурок
          </div>
          <div className="aspect-video">
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {lesson.contentBlocks.map((block) => (
          <p key={block} className="text-sm leading-7">
            {block}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-[28px] bg-ink px-5 py-5 text-white lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-white/70">
            {isCompleted ? 'Урок уже завершено. Можна рухатись далі.' : 'Після завершення урок відкриє наступний етап.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {previousHref ? (
            <Button variant="ghost" className="bg-white/5 text-white hover:bg-white/10" asChild>
              <Link className="inline-flex items-center gap-2" to={previousHref}>
                <ArrowLeft className="size-4" />
                Попередній
              </Link>
            </Button>
          ) : null}

          {!isCompleted ? (
            <Button variant="secondary" onClick={onMarkCompleted} disabled={isSaving}>
              <CheckCircle2 className="size-4" />
              {isSaving ? 'Зберігаємо...' : 'Позначити як завершений'}
            </Button>
          ) : null}

          {nextHref ? (
            <Button asChild>
              <Link className="inline-flex items-center gap-2" to={nextHref}>
                Далі
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
