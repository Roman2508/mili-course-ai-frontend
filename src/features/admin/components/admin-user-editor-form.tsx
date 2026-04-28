import { KeyRound, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { getErrorMessage } from "@/api/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { AdminUserDetails, AdminUserUpdateValues } from "@/types/admin";
import type { AuthRole } from "@/types/auth";

interface AdminUserEditorFormProps {
  initialValues: AdminUserDetails;
  submitLabel: string;
  onSubmit: (values: AdminUserUpdateValues) => Promise<void>;
  isSubmitting?: boolean;
  error?: Error | null;
}

interface FormValues {
  name: string;
  email: string;
  role: AuthRole;
  profileSummary: string;
  interestsInput: string;
  password: string;
  confirmPassword: string;
}

function createFormValues(user: AdminUserDetails): FormValues {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    profileSummary: user.profileSummary,
    interestsInput: user.interests.join(", "),
    password: "",
    confirmPassword: "",
  };
}

function normalizeInterests(input: string): string[] {
  const uniqueInterests = new Map<string, string>();

  for (const rawItem of input.split(/[\n,]/g)) {
    const normalizedInterest = rawItem.replace(/\s+/g, " ").trim();

    if (normalizedInterest.length === 0) {
      continue;
    }

    const dedupeKey = normalizedInterest.toLowerCase();

    if (!uniqueInterests.has(dedupeKey)) {
      uniqueInterests.set(dedupeKey, normalizedInterest);
    }
  }

  return [...uniqueInterests.values()];
}

function areArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item === right[index]);
}

function getRoleLabel(role: AuthRole) {
  return role === "admin" ? "Адміністратор" : "Курсант";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminUserEditorForm({
  initialValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
  error = null,
}: AdminUserEditorFormProps) {
  const [values, setValues] = useState<FormValues>(() =>
    createFormValues(initialValues),
  );

  useEffect(() => {
    setValues(createFormValues(initialValues));
  }, [initialValues]);

  const normalizedName = values.name.trim();
  const normalizedEmail = values.email.trim().toLowerCase();
  const normalizedProfileSummary = values.profileSummary.trim();
  const normalizedInterests = normalizeInterests(values.interestsInput);
  const normalizedInitialEmail = initialValues.email.trim().toLowerCase();
  const isInterestsLimitExceeded = normalizedInterests.length > 12;
  const isPasswordDirty =
    values.password.length > 0 || values.confirmPassword.length > 0;
  const isPasswordTooShort =
    values.password.length > 0 && values.password.length < 10;
  const isPasswordTooLong = values.password.length > 128;
  const doPasswordsMatch =
    values.confirmPassword.length > 0 &&
    values.password === values.confirmPassword;
  const isDirty =
    normalizedName !== initialValues.name ||
    normalizedEmail !== normalizedInitialEmail ||
    values.role !== initialValues.role ||
    normalizedProfileSummary !== initialValues.profileSummary ||
    !areArraysEqual(normalizedInterests, initialValues.interests) ||
    isPasswordDirty;
  const canSubmit =
    isDirty &&
    normalizedName.length >= 2 &&
    isValidEmail(normalizedEmail) &&
    !isInterestsLimitExceeded &&
    (!isPasswordDirty ||
      (values.password.length >= 10 &&
        !isPasswordTooLong &&
        doPasswordsMatch)) &&
    !isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      name: normalizedName,
      email: normalizedEmail,
      role: values.role,
      profileSummary: normalizedProfileSummary,
      interests: normalizedInterests,
      password: values.password.length > 0 ? values.password : undefined,
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-field/10 p-3 text-field">
              <UserRound className="size-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Основні дані</h2>
              <p className="text-sm text-slate">
                Змінюйте ім&apos;я, пошту, роль, опис та інтереси користувача з
                однієї сторінки.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Ім'я" hint="Відображається в інтерфейсі.">
              <Input
                value={values.name}
                maxLength={120}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ім'я користувача"
                required
              />
            </Field>

            <Field label="Роль" hint="Впливає на доступ до адмін-розділів.">
              <Select
                value={values.role}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    role: event.target.value as AuthRole,
                  }))
                }
              >
                <option value="student">Курсант</option>
                <option value="admin">Адміністратор</option>
              </Select>
            </Field>
          </div>

          <div>
            <Field
              label="Email"
              hint="Зміна email оновлює адресу входу користувача."
            >
              <Input
                type="email"
                value={values.email}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="user@example.com"
                required
              />
            </Field>
          </div>

          <div>
            <Field
              label="Короткий опис"
              hint="До 600 символів. Використовується в профілі та контексті навчання."
            >
              <Textarea
                value={values.profileSummary}
                maxLength={600}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    profileSummary: event.target.value,
                  }))
                }
                placeholder="Короткий опис досвіду, завдань або навчальних цілей."
              />
            </Field>
          </div>

          <div>
            <Field
              label="Інтереси"
              hint="Вкажіть теми через кому або з нового рядка. До 12 значень."
            >
              <Input
                value={values.interestsInput}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    interestsInput: event.target.value,
                  }))
                }
                placeholder="OSINT, дрони, тактична медицина"
              />
            </Field>
          </div>

          <div className="space-y-3 rounded-[24px] bg-ink/5 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-ink">
                Попередній перегляд інтересів
              </p>
              <p
                className={`text-xs font-medium ${
                  isInterestsLimitExceeded ? "text-signal" : "text-slate"
                }`}
              >
                {normalizedInterests.length}/12
              </p>
            </div>

            {normalizedInterests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {normalizedInterests.map((interest) => (
                  <Badge key={interest} tone="field">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate">Інтереси поки ще не вказано.</p>
            )}
          </div>

          <div className="space-y-5 border-t border-ink/10 pt-5">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-brass/15 p-3 text-brass">
                <KeyRound className="size-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Новий пароль</h2>
                <p className="text-sm text-slate">
                  Залиште поля порожніми, якщо пароль не потрібно змінювати.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Новий пароль" hint="Від 10 до 128 символів.">
                <Input
                  type="password"
                  value={values.password}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Новий пароль"
                  autoComplete="new-password"
                />
              </Field>

              <Field
                label="Підтвердження пароля"
                hint="Від 10 до 128 символів."
              >
                <Input
                  type="password"
                  value={values.confirmPassword}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Повторіть новий пароль"
                  autoComplete="new-password"
                />
              </Field>
            </div>
          </div>

          {!isValidEmail(normalizedEmail) && normalizedEmail.length > 0 ? (
            <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
              Вкажіть коректну email-адресу.
            </div>
          ) : null}

          {isInterestsLimitExceeded ? (
            <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
              Залиште не більше 12 унікальних інтересів.
            </div>
          ) : null}

          {isPasswordTooShort ? (
            <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
              Пароль має містити щонайменше 10 символів.
            </div>
          ) : null}

          {isPasswordTooLong ? (
            <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
              Пароль має містити не більше 128 символів.
            </div>
          ) : null}

          {isPasswordDirty &&
          values.confirmPassword.length > 0 &&
          !doPasswordsMatch ? (
            <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
              Підтвердження пароля не збігається.
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
              {getErrorMessage(error)}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm text-slate">
              <p>
                {isDirty ? "У формі є незбережені зміни." : "Змін поки немає."}
              </p>
            </div>

            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? (
                <Spinner className="text-white" />
              ) : (
                <Save className="size-4" />
              )}
              {isSubmitting ? "Зберігаємо..." : submitLabel}
            </Button>
          </div>
        </Card>
      </form>

      <div className="space-y-6">
        <Card className="space-y-5 bg-ink text-white">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white/10 p-3 text-white">
              <ShieldCheck className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.16em] text-white/55">
                Обліковий запис
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {normalizedName || initialValues.name}
              </h2>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                Роль
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {getRoleLabel(values.role)}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
            <div className="flex items-center gap-3 text-white/70">
              <Mail className="size-4" />
              <span className="text-sm">
                {normalizedEmail || initialValues.email}
              </span>
            </div>
            <div className="text-sm text-white/70">
              ID:{" "}
              <span className="font-semibold text-white">
                {initialValues.id}
              </span>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">Системна інформація</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-ink/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate">
                Створено
              </p>
              <p className="mt-3 text-sm font-semibold text-ink">
                {formatDate(initialValues.createdAt)}
              </p>
            </div>

            <div className="rounded-[24px] bg-ink/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate">
                Останнє оновлення
              </p>
              <p className="mt-3 text-sm font-semibold text-ink">
                {formatDate(initialValues.updatedAt)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
