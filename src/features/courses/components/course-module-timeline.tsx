import { CheckCircle2, ChevronRight, FileCheck2, LockKeyhole, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  areAllModuleLessonsCompleted,
  getLessonHref,
  getModuleTestResult,
  getTestHref,
  isLessonCompleted,
  isLessonUnlocked,
  isModuleTestPassed,
  isModuleTestUnlocked,
} from '@/features/learning/lib/course-progress';
import type { Course } from '@/types/course';
import type { UserLearningCourse } from '@/types/learning';

interface CourseModuleTimelineProps {
  course: Course;
  learningEntry?: UserLearningCourse;
}

export function CourseModuleTimeline({ course, learningEntry }: CourseModuleTimelineProps) {
  return (
    <div className="space-y-4">
      {course.modules.map((courseModule) => {
        const testUnlocked = isModuleTestUnlocked(courseModule, learningEntry);
        const testPassed = isModuleTestPassed(courseModule, learningEntry);
        const testResult = getModuleTestResult(learningEntry, courseModule.id);

        return (
          <Card key={courseModule.id} className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Badge tone="field">Модуль {courseModule.order}</Badge>
                <div>
                  <h3 className="text-xl font-semibold">{courseModule.title}</h3>
                  <p className="mt-2 text-sm">{courseModule.description}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-ink/5 px-4 py-3 text-sm">
                <p className="font-semibold text-ink">{courseModule.lessons.length} уроків</p>
                <p className="text-slate">
                  {areAllModuleLessonsCompleted(courseModule, learningEntry)
                    ? 'Уроки завершено'
                    : 'Тест відкриється після всіх уроків'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {courseModule.lessons.map((lesson, index) => {
                const completed = isLessonCompleted(learningEntry, lesson.id);
                const unlocked = isLessonUnlocked(course, learningEntry, courseModule.id, lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white/60 p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {completed ? (
                          <CheckCircle2 className="size-5 text-field" />
                        ) : unlocked ? (
                          <PlayCircle className="size-5 text-brass" />
                        ) : (
                          <LockKeyhole className="size-5 text-slate/70" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-slate">Урок {index + 1}</p>
                        <h4 className="text-base font-semibold">{lesson.title}</h4>
                        <p className="mt-1 text-sm">{lesson.summary}</p>
                      </div>
                    </div>
                    {unlocked ? (
                      <Button variant="ghost" asChild>
                        <Link
                          className="inline-flex items-center gap-2"
                          to={getLessonHref(course.id, courseModule.id, lesson.id)}
                        >
                          {completed ? 'Переглянути ще раз' : 'Відкрити урок'}
                          <ChevronRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled>
                        Урок заблоковано
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-3xl bg-ink px-5 py-5 text-white">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 text-white/70">
                    <FileCheck2 className="size-4" />
                    Тест модуля
                  </div>
                  <h4 className="text-xl font-semibold">{courseModule.test.title}</h4>
                  <p className="text-sm text-white/65">{courseModule.test.description}</p>
                </div>
                <div className="text-left lg:text-right">
                  {testResult ? (
                    <p className="text-sm text-white/80">
                      Результат: <span className="font-semibold text-white">{testResult.score}%</span>
                    </p>
                  ) : (
                    <p className="text-sm text-white/55">Ще не проходили тест</p>
                  )}
                  {testUnlocked ? (
                    <Button variant="secondary" className="mt-3" asChild>
                      <Link className="inline-flex items-center gap-2" to={getTestHref(course.id, courseModule.id)}>
                        {testPassed ? 'Перепройти тест' : 'Почати тест'}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" className="mt-3" disabled>
                      Завершіть уроки модуля
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
