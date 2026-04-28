import { PenSquare, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Course } from "@/types/course";

interface AdminCourseTableProps {
  courses: Course[];
}

const difficultyLabels = {
  beginner: "Початковий",
  intermediate: "Середній",
  advanced: "Просунутий",
};

export function AdminCourseTable({ courses }: AdminCourseTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold">Каталог курсів</h2>
          <p className="mt-1 text-sm">Список навчальних курсів</p>
        </div>
        <Button asChild>
          <Link
            className="inline-flex items-center gap-2"
            to="/admin/courses/new"
          >
            <Plus className="size-4" />
            Створити курс
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-ink/5 text-xs uppercase tracking-[0.16em] text-slate">
            <tr>
              <th className="px-4 py-4 font-semibold">Курс</th>
              <th className="px-4 py-4 font-semibold">Складність</th>
              <th className="px-4 py-4 font-semibold">Теги</th>
              <th className="px-4 py-4 font-semibold">Модулі</th>
              <th className="px-4 py-4 font-semibold">Дія</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-t border-ink/8">
                <td className="px-4 py-2">
                  <div>
                    <p className="font-semibold text-ink">{course.title}</p>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <Badge tone="field">
                    {difficultyLabels[course.difficulty]}
                  </Badge>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    {course.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm font-semibold text-ink">
                  {course.modules.length}
                </td>

                <td className="px-4 py-2">
                  <Button variant="ghost" asChild>
                    <Link
                      className="inline-flex items-center gap-2"
                      to={`/admin/courses/${course.id}/edit`}
                    >
                      <PenSquare className="size-4" />
                      Редагувати
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
