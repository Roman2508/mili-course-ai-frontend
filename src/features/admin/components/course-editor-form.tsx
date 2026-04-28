import { Plus, Trash2, WandSparkles } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGenerateEmbeddingMutation } from "@/features/admin/hooks/use-generate-embedding";
import {
  buildEmbeddingText,
  createEmptyCourseFormValues,
  createEmptyLesson,
  createEmptyModule,
  createEmptyQuestion,
  normalizeTags,
} from "@/features/admin/lib/course-form";
import type { AdminCourseFormValues } from "@/types/admin";
import type {
  CourseLesson,
  CourseModule,
  CourseTestQuestion,
  DifficultyLevel,
} from "@/types/course";

interface CourseEditorFormProps {
  initialValues?: AdminCourseFormValues;
  submitLabel: string;
  onSubmit: (values: AdminCourseFormValues) => Promise<void>;
}

function updateModules(modules: CourseModule[]) {
  return modules.map((module, index) => ({
    ...module,
    order: index + 1,
  }));
}

function createLessonContentInputs(modules: CourseModule[]) {
  return Object.fromEntries(
    modules.flatMap((module) =>
      module.lessons.map((lesson) => [
        lesson.id,
        lesson.contentBlocks.join("\n"),
      ]),
    ),
  );
}

export function CourseEditorForm({
  initialValues,
  submitLabel,
  onSubmit,
}: CourseEditorFormProps) {
  const initialFormValues = initialValues ?? createEmptyCourseFormValues();
  const [values, setValues] =
    useState<AdminCourseFormValues>(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagsInput, setTagsInput] = useState(initialFormValues.tags.join(", "));
  const [lessonContentInputs, setLessonContentInputs] = useState<
    Record<string, string>
  >(createLessonContentInputs(initialFormValues.modules));
  const generateEmbeddingMutation = useGenerateEmbeddingMutation();

  useEffect(() => {
    const nextValues = initialValues ?? createEmptyCourseFormValues();
    setValues(nextValues);
    setTagsInput(nextValues.tags.join(", "));
    setLessonContentInputs(createLessonContentInputs(nextValues.modules));
  }, [initialValues]);

  useEffect(() => {
    const nextEmbeddingText = buildEmbeddingText(
      values.title,
      values.description,
    );
    setValues((current) =>
      current.embeddingText === nextEmbeddingText
        ? current
        : {
            ...current,
            embeddingText: nextEmbeddingText,
          },
    );
  }, [values.description, values.title]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateModule(
    moduleId: string,
    updater: (module: CourseModule) => CourseModule,
  ) {
    setValues((current) => ({
      ...current,
      modules: current.modules.map((module) =>
        module.id === moduleId ? updater(module) : module,
      ),
    }));
  }

  function updateLesson(
    moduleId: string,
    lessonId: string,
    updater: (lesson: CourseLesson) => CourseLesson,
  ) {
    updateModule(moduleId, (module) => ({
      ...module,
      lessons: module.lessons.map((lesson) =>
        lesson.id === lessonId ? updater(lesson) : lesson,
      ),
    }));
  }

  function updateQuestion(
    moduleId: string,
    questionId: string,
    updater: (question: CourseTestQuestion) => CourseTestQuestion,
  ) {
    updateModule(moduleId, (module) => ({
      ...module,
      test: {
        ...module.test,
        questions: module.test.questions.map((question) =>
          question.id === questionId ? updater(question) : question,
        ),
      },
    }));
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="grid gap-5 lg:grid-cols-1">
        <Field label="Назва">
          <Input
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="Назва курсу"
            required
          />
        </Field>
        <Field label="Складність">
          <Select
            value={values.difficulty}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                difficulty: event.target.value as DifficultyLevel,
              }))
            }
          >
            <option value="beginner">Початковий</option>
            <option value="intermediate">Середній</option>
            <option value="advanced">Просунутий</option>
          </Select>
        </Field>
        <Field
          label="Короткий опис"
          hint="Короткий текст для картки курсу й адмін-списку."
        >
          <Textarea
            value={values.shortDescription}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                shortDescription: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="URL обкладинки">
          <Input
            value={values.coverImage}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                coverImage: event.target.value,
              }))
            }
            placeholder="https://..."
          />
        </Field>
        <Field label="Опис" hint="Повний опис курсу на сторінці деталей.">
          <Textarea
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </Field>
        <div className="grid gap-5 grid-cols-1">
          <Field label="Теги" hint="Через кому, без дублювання.">
            <Input
              value={tagsInput}
              onChange={(event) => {
                const nextTagsInput = event.target.value;
                setTagsInput(nextTagsInput);
                setValues((current) => ({
                  ...current,
                  tags: normalizeTags(nextTagsInput),
                }));
              }}
              placeholder="навігація, планування"
              className="w-full"
            />
          </Field>

          <Field label="Орієнтовна тривалість">
            <Input
              type="number"
              min={1}
              value={values.estimatedHours}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  estimatedHours: Number(event.target.value),
                }))
              }
            />
          </Field>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Інтелектуальні метадані</h2>
            <p className="mt-2 text-sm">
              Окреме поле для семантичного пошуку й рекомендацій. Згенерований
              embedding зберігається у формі окремо від UI-стану.
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={
              generateEmbeddingMutation.isPending ||
              !values.embeddingText.trim()
            }
            onClick={async () => {
              const generatedEmbedding =
                await generateEmbeddingMutation.mutateAsync(
                  values.embeddingText,
                );
              setValues((current) => ({ ...current, generatedEmbedding }));
            }}
          >
            <WandSparkles className="size-4" />
            {generateEmbeddingMutation.isPending
              ? "Генеруємо..."
              : "Згенерувати embedding"}
          </Button>
        </div>

        <Field
          label="Текст для embedding"
          hint="Автоматично формується у вигляді «Назва курсу. Опис». Можна редагувати вручну, але після зміни назви або опису поле перегенерується."
        >
          <Textarea
            value={values.embeddingText}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                embeddingText: event.target.value,
              }))
            }
            placeholder="Назва курсу. Опис курсу..."
          />
        </Field>

        {generateEmbeddingMutation.isPending &&
        generateEmbeddingMutation.modelLoadState.stage === "loading" ? (
          <div className="rounded-[28px] border border-ink/10 bg-white p-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink">
                Завантаження embedding-моделі
              </p>
              <ProgressBar
                value={generateEmbeddingMutation.modelLoadState.progress}
              />
              <p className="text-xs text-slate">
                {generateEmbeddingMutation.modelLoadState.message ??
                  "Готуємо модель до генерації embedding."}
              </p>
              {generateEmbeddingMutation.modelLoadState.activeFile ? (
                <p className="break-all text-xs text-slate">
                  Поточний файл:{" "}
                  {generateEmbeddingMutation.modelLoadState.activeFile}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="rounded-[28px] bg-ink/5 p-5">
          {values.generatedEmbedding ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">
                Embedding згенеровано
              </p>
              <p className="text-sm text-slate">
                {values.generatedEmbedding.dimension} вимірів ·{" "}
                {values.generatedEmbedding.model}
              </p>
              <p className="break-all text-xs font-medium text-slate">
                Попередній перегляд:{" "}
                {values.generatedEmbedding.vector
                  .slice(0, 8)
                  .map((item) => item.toFixed(4))
                  .join(", ")}
              </p>
            </div>
          ) : (
            <p className="text-sm">Embedding ще не згенеровано.</p>
          )}
        </div>
      </Card>

      <div className="space-y-5">
        {values.modules.map((module, moduleIndex) => (
          <Card key={module.id} className="space-y-6">
            <div className="flex gap-3 flex-col">
              <div className="flex gap-3 justify-between items-center">
                <p className="text-xs uppercase tracking-[0.16em] text-slate">
                  Модуль {moduleIndex + 1}
                </p>

                <Button
                  variant="ghost"
                  className="text-signal"
                  onClick={() => {
                    setLessonContentInputs((current) => {
                      const nextInputs = { ...current };
                      module.lessons.forEach((lesson) => {
                        delete nextInputs[lesson.id];
                      });
                      return nextInputs;
                    });
                    setValues((current) => ({
                      ...current,
                      modules: updateModules(
                        current.modules.filter((item) => item.id !== module.id),
                      ),
                    }));
                  }}
                  disabled={values.modules.length === 1}
                >
                  <Trash2 className="size-4" />
                  Видалити модуль
                </Button>
              </div>

              <div className="grid gap-4 grid-cols-1">
                <Field label="Назва модуля">
                  <Input
                    className="w-full"
                    value={module.title}
                    onChange={(event) =>
                      updateModule(module.id, (current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Опис модуля">
                  <Input
                    className="w-full"
                    value={module.description}
                    onChange={(event) =>
                      updateModule(module.id, (current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] bg-ink/5 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Уроки</h3>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const newLesson = createEmptyLesson();
                    setLessonContentInputs((current) => ({
                      ...current,
                      [newLesson.id]: newLesson.contentBlocks.join("\n"),
                    }));
                    updateModule(module.id, (current) => ({
                      ...current,
                      lessons: [...current.lessons, newLesson],
                    }));
                  }}
                >
                  <Plus className="size-4" />
                  Додати урок
                </Button>
              </div>

              <div className="space-y-4">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="rounded-[24px] border border-ink/10 bg-white p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">
                        Урок {lessonIndex + 1}
                      </p>
                      <Button
                        variant="ghost"
                        className="text-signal"
                        onClick={() => {
                          setLessonContentInputs((current) => {
                            const nextInputs = { ...current };
                            delete nextInputs[lesson.id];
                            return nextInputs;
                          });
                          updateModule(module.id, (current) => ({
                            ...current,
                            lessons: current.lessons.filter(
                              (item) => item.id !== lesson.id,
                            ),
                          }));
                        }}
                        disabled={module.lessons.length === 1}
                      >
                        <Trash2 className="size-4" />
                        Видалити
                      </Button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="Назва уроку">
                        <Input
                          value={lesson.title}
                          onChange={(event) =>
                            updateLesson(module.id, lesson.id, (current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Короткий опис">
                        <Input
                          value={lesson.summary}
                          onChange={(event) =>
                            updateLesson(module.id, lesson.id, (current) => ({
                              ...current,
                              summary: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Тип контенту">
                        <Select
                          value={lesson.contentType}
                          onChange={(event) =>
                            updateLesson(module.id, lesson.id, (current) => ({
                              ...current,
                              contentType: event.target
                                .value as CourseLesson["contentType"],
                            }))
                          }
                        >
                          <option value="text">text</option>
                          <option value="video">video</option>
                        </Select>
                      </Field>
                      <Field label="Тривалість у хвилинах">
                        <Input
                          type="number"
                          min={1}
                          value={lesson.durationMinutes}
                          onChange={(event) =>
                            updateLesson(module.id, lesson.id, (current) => ({
                              ...current,
                              durationMinutes: Number(event.target.value),
                            }))
                          }
                        />
                      </Field>
                    </div>

                    {lesson.contentType === "video" ? (
                      <Field label="URL відео">
                        <Input
                          value={lesson.videoUrl ?? ""}
                          onChange={(event) =>
                            updateLesson(module.id, lesson.id, (current) => ({
                              ...current,
                              videoUrl: event.target.value,
                            }))
                          }
                        />
                      </Field>
                    ) : null}

                    <br />

                    <Field label="Блоки контенту" hint="Один абзац на рядок.">
                      <Textarea
                        value={
                          lessonContentInputs[lesson.id] ??
                          lesson.contentBlocks.join("\n")
                        }
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          setLessonContentInputs((current) => ({
                            ...current,
                            [lesson.id]: nextValue,
                          }));
                          updateLesson(module.id, lesson.id, (current) => ({
                            ...current,
                            contentBlocks: nextValue
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          }));
                        }}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] bg-ink px-5 py-5 text-white">
              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Назва тесту" tone="inverse">
                  <Input
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    value={module.test.title}
                    onChange={(event) =>
                      updateModule(module.id, (current) => ({
                        ...current,
                        test: { ...current.test, title: event.target.value },
                      }))
                    }
                  />
                </Field>
                <Field label="Прохідний бал, %" tone="inverse">
                  <Input
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    type="number"
                    min={0}
                    max={100}
                    value={module.test.passingScore}
                    onChange={(event) =>
                      updateModule(module.id, (current) => ({
                        ...current,
                        test: {
                          ...current.test,
                          passingScore: Number(event.target.value),
                        },
                      }))
                    }
                  />
                </Field>
                <Field label="Опис тесту" tone="inverse">
                  <Input
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    value={module.test.description}
                    onChange={(event) =>
                      updateModule(module.id, (current) => ({
                        ...current,
                        test: {
                          ...current.test,
                          description: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Питання</h3>
                <Button
                  variant="ghost"
                  className="bg-white/5 text-white hover:bg-white/10"
                  onClick={() =>
                    updateModule(module.id, (current) => ({
                      ...current,
                      test: {
                        ...current.test,
                        questions: [
                          ...current.test.questions,
                          createEmptyQuestion(
                            current.test.questions.length + 1,
                          ),
                        ],
                      },
                    }))
                  }
                >
                  <Plus className="size-4" />
                  Додати питання
                </Button>
              </div>

              <div className="space-y-4">
                {module.test.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="rounded-[24px] bg-white/5 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/90">
                        Питання {questionIndex + 1}
                      </p>
                      <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                        onClick={() =>
                          updateModule(module.id, (current) => ({
                            ...current,
                            test: {
                              ...current.test,
                              questions: current.test.questions.filter(
                                (item) => item.id !== question.id,
                              ),
                            },
                          }))
                        }
                        disabled={module.test.questions.length === 1}
                      >
                        <Trash2 className="size-4" />
                        Видалити
                      </Button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="Формулювання" tone="inverse">
                        <Input
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                          value={question.prompt}
                          onChange={(event) =>
                            updateQuestion(
                              module.id,
                              question.id,
                              (current) => ({
                                ...current,
                                prompt: event.target.value,
                              }),
                            )
                          }
                        />
                      </Field>
                      <Field label="Тема" tone="inverse">
                        <Input
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                          value={question.topic}
                          onChange={(event) =>
                            updateQuestion(
                              module.id,
                              question.id,
                              (current) => ({
                                ...current,
                                topic: event.target.value,
                              }),
                            )
                          }
                        />
                      </Field>
                    </div>

                    <Field
                      label="Варіанти"
                      hint="Один варіант на рядок."
                      tone="inverse"
                    >
                      <Textarea
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                        value={question.options.join("\n")}
                        onChange={(event) =>
                          updateQuestion(module.id, question.id, (current) => ({
                            ...current,
                            options: event.target.value
                              .split("\n")
                              .map((item) => item.trim())
                              .filter(Boolean),
                          }))
                        }
                      />
                    </Field>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <Field label="Правильна відповідь" tone="inverse">
                        <Select
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/40 [&>option]:text-black"
                          value={question.correctOptionIndex}
                          onChange={(event) =>
                            updateQuestion(
                              module.id,
                              question.id,
                              (current) => ({
                                ...current,
                                correctOptionIndex: Number(event.target.value),
                              }),
                            )
                          }
                        >
                          {question.options.map((option, optionIndex) => (
                            <option
                              key={`${question.id}-${optionIndex}`}
                              value={optionIndex}
                            >
                              {optionIndex + 1}. {option}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Пояснення" tone="inverse">
                        <Input
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                          value={question.explanation}
                          onChange={(event) =>
                            updateQuestion(
                              module.id,
                              question.id,
                              (current) => ({
                                ...current,
                                explanation: event.target.value,
                              }),
                            )
                          }
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            const newModule = createEmptyModule(values.modules.length + 1);
            setLessonContentInputs((current) => ({
              ...current,
              ...createLessonContentInputs([newModule]),
            }));
            setValues((current) => ({
              ...current,
              modules: updateModules([...current.modules, newModule]),
            }));
          }}
        >
          <Plus className="size-4" />
          Додати модуль
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Зберігаємо..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
