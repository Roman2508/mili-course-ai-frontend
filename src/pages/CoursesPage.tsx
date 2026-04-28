import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/page-state";
import { Spinner } from "@/components/ui/spinner";
import { CourseCard } from "@/features/courses/components/course-card";
import { CourseFilters } from "@/features/courses/components/course-filters";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useMyLearning } from "@/features/learning/hooks/use-my-learning";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import type { DifficultyLevel } from "@/types/course";

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    DifficultyLevel | "all"
  >("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 350);
  const coursesQuery = useCourses({
    page,
    limit: 6,
    search: debouncedSearch.trim() || undefined,
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
    tags: selectedTag === "all" ? undefined : [selectedTag],
  });
  const catalogQuery = useCourses();
  const myLearningQuery = useMyLearning();

  const availableTags = useMemo(() => {
    const source = catalogQuery.data?.items ?? [];
    return Array.from(new Set(source.flatMap((course) => course.tags))).sort();
  }, [catalogQuery.data?.items]);

  const courses = coursesQuery.data?.items ?? [];
  const totalPages = coursesQuery.data?.meta.totalPages ?? 1;

  if (
    catalogQuery.isPending ||
    myLearningQuery.isPending ||
    (coursesQuery.isPending && !coursesQuery.data)
  ) {
    return (
      <LoadingState
        title="Завантажуємо каталог курсів"
        description="Отримуємо каталог, фільтри та знижки навчального потоку."
      />
    );
  }

  if (coursesQuery.isError || catalogQuery.isError || myLearningQuery.isError) {
    return (
      <ErrorState
        onRetry={() => {
          void Promise.all([
            coursesQuery.refetch(),
            catalogQuery.refetch(),
            myLearningQuery.refetch(),
          ]);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Каталог"
        title="Каталог курсів"
        description="Загальний перелік навчальних курсів з можливістю пошуку по назві курсу, тегах та складності."
      />

      <CourseFilters
        search={search}
        selectedTag={selectedTag}
        selectedDifficulty={selectedDifficulty}
        availableTags={availableTags}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onTagChange={(value) => {
          setSelectedTag(value);
          setPage(1);
        }}
        onDifficultyChange={(value) => {
          setSelectedDifficulty(value);
          setPage(1);
        }}
      />

      {courses.length === 0 ? (
        <EmptyState
          title="Курсів не знайдено"
          description="Спробуйте змінити фільтри або очистити пошук."
        />
      ) : (
        <>
          <div className="relative">
            <div
              className={cn(
                "grid gap-5 xl:grid-cols-2 2xl:grid-cols-3",
                coursesQuery.isFetching ? "opacity-70" : null,
              )}
            >
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  learningEntry={myLearningQuery.data?.courses.find(
                    (item) => item.courseId === course.id,
                  )}
                />
              ))}
            </div>
            {coursesQuery.isFetching ? (
              <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 grid place-items-center">
                <div className="rounded-full bg-white/70 p-3 shadow-panel backdrop-blur">
                  <Spinner className="size-6" />
                </div>
              </div>
            ) : null}
          </div>

          {totalPages > 1 ? (
            <div className="flex flex-col gap-3 rounded-[28px] bg-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                Сторінка <span className="font-semibold text-ink">{page}</span>{" "}
                з <span className="font-semibold text-ink">{totalPages}</span>
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                >
                  Попередня
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages}
                >
                  Наступна
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
