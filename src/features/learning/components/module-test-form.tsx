import { type FormEvent, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { CourseModule } from '@/types/course'
import type { ModuleTestResult } from '@/types/learning'

interface ModuleTestFormProps {
  courseModule: CourseModule
  existingResult?: ModuleTestResult
  isSubmitting: boolean
  onSubmit: (answers: Record<string, number>) => Promise<void>
}

export function ModuleTestForm({ courseModule, existingResult, isSubmitting, onSubmit }: ModuleTestFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(existingResult?.answers ?? {})
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, number> | null>(
    existingResult?.answers ?? null,
  )

  const score = useMemo(() => {
    const currentAnswers = submittedAnswers ?? existingResult?.answers

    if (!currentAnswers) {
      return null
    }

    const correctAnswers = courseModule.test.questions.reduce((total, question) => {
      return total + Number(currentAnswers[question.id] === question.correctOptionIndex)
    }, 0)

    return Math.round((correctAnswers / courseModule.test.questions.length) * 100)
  }, [courseModule.test.questions, existingResult?.answers, submittedAnswers])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(answers)
    setSubmittedAnswers(answers)
  }

  return (
    <Card className="space-y-6">
      <div className="space-y-3">
        <Badge tone="field">Оцінювання модуля</Badge>
        <div>
          <h1 className="text-3xl font-semibold">{courseModule.test.title}</h1>
          <p className="mt-2 text-sm">{courseModule.test.description}</p>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {courseModule.test.questions.map((question, questionIndex) => {
          const selectedAnswer = answers[question.id]
          const hasSubmitted = submittedAnswers !== null
          const isCorrect = submittedAnswers?.[question.id] === question.correctOptionIndex

          return (
            <div key={question.id} className="rounded-[28px] border border-ink/10 bg-white/70 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-slate">Питання {questionIndex + 1}</p>
              <h3 className="mt-2 text-lg font-semibold">{question.prompt}</h3>
              <div className="mt-4 grid gap-3">
                {question.options.map((option, optionIndex) => {
                  const selected = selectedAnswer === optionIndex
                  const shouldHighlightCorrect = hasSubmitted && optionIndex === question.correctOptionIndex
                  const shouldHighlightWrong = hasSubmitted && selected && optionIndex !== question.correctOptionIndex

                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        shouldHighlightCorrect
                          ? 'border-field bg-field/10'
                          : shouldHighlightWrong
                            ? 'border-signal bg-signal/10'
                            : selected
                              ? 'border-ink bg-ink/5'
                              : 'border-ink/10 bg-white hover:border-ink/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        checked={selected}
                        onChange={() => {
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: optionIndex,
                          }))
                        }}
                        className="mt-1"
                      />
                      <span className="text-sm leading-6 text-ink">{option}</span>
                    </label>
                  )
                })}
              </div>
              {hasSubmitted ? (
                <p className={`mt-4 text-sm ${isCorrect ? 'text-field' : 'text-signal'}`}>{question.explanation}</p>
              ) : null}
            </div>
          )
        })}

        <div className="flex flex-col gap-3 rounded-[28px] bg-ink px-5 py-5 text-white lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-white/70">Прохідний бал: {courseModule.test.passingScore}%</p>
            {score !== null ? <p className="mt-1 text-lg font-semibold">Поточний результат: {score}%</p> : null}
          </div>
          <Button type="submit" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? 'Зберігаємо...' : 'Надіслати тест'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
