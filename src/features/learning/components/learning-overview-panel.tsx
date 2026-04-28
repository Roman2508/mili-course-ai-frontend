import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ProgressBar } from '@/components/ui/progress-bar'
import type { MyLearningData } from '@/types/learning'

interface LearningOverviewPanelProps {
  learning: MyLearningData
}

export function LearningOverviewPanel({ learning }: LearningOverviewPanelProps) {
  const activeCourses = learning.courses.filter((course) => course.status === 'in_progress').length
  const completedCourses = learning.courses.filter((course) => course.status === 'completed').length
  const averageProgress =
    learning.courses.length > 0
      ? learning.courses.reduce((sum, course) => sum + course.progressPercent, 0) / learning.courses.length
      : 0

  return (
    <Card className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-5">
        <div className="space-y-3">
          <Badge tone="field">Профіль навчання</Badge>
          <h2 className="text-2xl font-semibold">Персональний прогрес і зони посилення</h2>
          <p className="text-sm">{learning.profileSummary}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-ink px-4 py-5 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Активні</p>
            <p className="mt-2 text-3xl font-semibold text-white/90">{activeCourses}</p>
          </div>
          <div className="rounded-3xl bg-white px-4 py-5 shadow-inner">
            <p className="text-xs uppercase tracking-[0.16em] text-slate">Завершені</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{completedCourses}</p>
          </div>
          <div className="rounded-3xl bg-brass/10 px-4 py-5">
            <p className="text-xs uppercase tracking-[0.16em] text-brass">Середній прогрес</p>
            <p className="mt-2 text-3xl font-semibold text-brass">{Math.round(averageProgress)}%</p>
          </div>
        </div>

        <ProgressBar value={averageProgress} />
      </div>

      <div className="space-y-4 rounded-[28px] bg-ink/5 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate">Слабкі теми</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {learning.weakTopics.map((topic) => (
              <Badge key={topic.id} tone="signal">
                {topic.label}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate">Інтереси</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {learning.interests.map((interest) => (
              <Badge key={interest} tone="field">
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
