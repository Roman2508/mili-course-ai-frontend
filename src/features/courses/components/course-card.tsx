import { ArrowRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Course } from "@/types/course";
import type { UserLearningCourse } from "@/types/learning";

interface CourseCardProps {
  course: Course;
  learningEntry?: UserLearningCourse;
}

const statusLabels = {
  not_started: "Не розпочато",
  in_progress: "У процесі",
  completed: "Завершено",
};

const difficultyLabels = {
  beginner: "Початковий",
  intermediate: "Середній",
  advanced: "Просунутий",
};

export function CourseCard({ course, learningEntry }: CourseCardProps) {
  return (
    <Card className="overflow-hidden p-0 flex flex-col">
      <img
        src={course.coverImage}
        alt={course.title}
        className="h-52 w-full object-cover"
      />

      <div className="space-y-5 p-6 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="field">{difficultyLabels[course.difficulty]}</Badge>
          {course.tags.slice(0, 2).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold">{course.title}</h3>
          <p className="text-sm">{course.shortDescription}</p>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-ink/5 px-4 py-3 text-sm text-slate">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="size-4" />
            {course.estimatedHours} год
          </span>
          <span className="font-semibold text-ink">
            {course.modules.length} модулів
          </span>
        </div>

        {learningEntry ? (
          <div className="space-y-3 rounded-2xl bg-field/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">Статус користувача</span>
              <Badge
                tone={
                  learningEntry.status === "completed" ? "field" : "warning"
                }
              >
                {statusLabels[learningEntry.status]}
              </Badge>
            </div>
            <ProgressBar value={learningEntry.progressPercent} />
          </div>
        ) : null}

        <div className="flex items-end flex-1">
          <Button asChild className="w-full">
            <Link
              className="inline-flex w-full items-center justify-center gap-2"
              to={`/courses/${course.id}`}
            >
              Відкрити курс
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
