import { KeyRound, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { getErrorMessage } from "@/api/api-error";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ErrorState, LoadingState } from "@/components/ui/page-state";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/features/profile/hooks/use-profile";
import type { UserProfile } from "@/types/profile";

interface ProfileFormValues {
  name: string;
  profileSummary: string;
  interestsInput: string;
}

interface EmailFormValues {
  email: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  revokeOtherSessions: boolean;
}

const EMPTY_PROFILE_FORM_VALUES: ProfileFormValues = {
  name: "",
  profileSummary: "",
  interestsInput: "",
};

const EMPTY_EMAIL_FORM_VALUES: EmailFormValues = {
  email: "",
};

const EMPTY_PASSWORD_FORM_VALUES: PasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  revokeOtherSessions: true,
};

function createProfileFormValues(profile: UserProfile): ProfileFormValues {
  return {
    name: profile.name,
    profileSummary: profile.profileSummary,
    interestsInput: profile.interests.join(", "),
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

function getRoleLabel(role: UserProfile["role"]) {
  return role === "admin" ? "Адміністратор" : "Курсант";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ProfilePage() {
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const changeEmailMutation = useChangeEmailMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const [profileValues, setProfileValues] = useState<ProfileFormValues>(
    EMPTY_PROFILE_FORM_VALUES,
  );
  const [emailValues, setEmailValues] = useState<EmailFormValues>(
    EMPTY_EMAIL_FORM_VALUES,
  );
  const [passwordValues, setPasswordValues] = useState<PasswordFormValues>(
    EMPTY_PASSWORD_FORM_VALUES,
  );
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!profileQuery.data || hasHydrated) {
      return;
    }

    setProfileValues(createProfileFormValues(profileQuery.data));
    setHasHydrated(true);
  }, [hasHydrated, profileQuery.data]);

  if (profileQuery.isPending) {
    return (
      <LoadingState
        title="Завантажуємо профіль"
        description="Підтягуємо ваші дані, щоб можна було відредагувати базову інформацію та налаштування безпеки."
      />
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <ErrorState
        title="Не вдалося завантажити профіль"
        description="Спробуйте оновити сторінку або повторити запит ще раз."
        onRetry={() => {
          void profileQuery.refetch();
        }}
      />
    );
  }

  const normalizedName = profileValues.name.trim();
  const normalizedProfileSummary = profileValues.profileSummary.trim();
  const interests = normalizeInterests(profileValues.interestsInput);
  const normalizedNewEmail = emailValues.email.trim().toLowerCase();
  const currentEmail = profileQuery.data.email.trim().toLowerCase();
  const isInterestsLimitExceeded = interests.length > 12;
  const isProfileDirty =
    normalizedName !== profileQuery.data.name ||
    normalizedProfileSummary !== profileQuery.data.profileSummary ||
    !areArraysEqual(interests, profileQuery.data.interests);
  const canSubmitProfile =
    isProfileDirty &&
    normalizedName.length >= 2 &&
    !isInterestsLimitExceeded &&
    !updateProfileMutation.isPending;
  const canSubmitEmail =
    normalizedNewEmail.length > 0 &&
    normalizedNewEmail !== currentEmail &&
    isValidEmail(normalizedNewEmail) &&
    !changeEmailMutation.isPending;
  const isPasswordTooShort =
    passwordValues.newPassword.length > 0 &&
    passwordValues.newPassword.length < 10;
  const isPasswordTooLong = passwordValues.newPassword.length > 128;
  const doPasswordsMatch =
    passwordValues.confirmPassword.length > 0 &&
    passwordValues.newPassword === passwordValues.confirmPassword;
  const isPasswordDirty =
    passwordValues.currentPassword.length > 0 ||
    passwordValues.newPassword.length > 0 ||
    passwordValues.confirmPassword.length > 0;
  const canSubmitPassword =
    passwordValues.currentPassword.length > 0 &&
    passwordValues.newPassword.length >= 10 &&
    !isPasswordTooLong &&
    passwordValues.newPassword !== passwordValues.currentPassword &&
    doPasswordsMatch &&
    !changePasswordMutation.isPending;

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const updatedProfile = await updateProfileMutation.mutateAsync({
      name: normalizedName,
      interests,
      profileSummary: normalizedProfileSummary,
    });

    setProfileValues(createProfileFormValues(updatedProfile));
    setHasHydrated(true);
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await changeEmailMutation.mutateAsync({
      email: normalizedNewEmail,
    });

    setEmailValues(EMPTY_EMAIL_FORM_VALUES);
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await changePasswordMutation.mutateAsync({
      currentPassword: passwordValues.currentPassword,
      newPassword: passwordValues.newPassword,
      revokeOtherSessions: passwordValues.revokeOtherSessions,
    });

    setPasswordValues((current) => ({
      ...EMPTY_PASSWORD_FORM_VALUES,
      revokeOtherSessions: current.revokeOtherSessions,
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Профіль"
        title="Профіль"
        description="Оновіть базову інформацію, пошту та пароль"
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="field">{getRoleLabel(profileQuery.data.role)}</Badge>
            <Badge tone="neutral">{interests.length} інтересів</Badge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <form className="space-y-6" onSubmit={handleProfileSubmit}>
          <Card className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-field/10 p-3 text-field">
                <UserRound className="size-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">Основна інформація</h2>
                <p className="text-sm text-slate">
                  Імʼя, короткий опис і навчальні інтереси зберігаються у вашому
                  профілі та використовуються для рекомендацій.
                </p>
              </div>
            </div>

            <div>
              <Field
                label="Ім'я"
                hint="Це ім'я відображається в інтерфейсі та поточній auth-сесії."
              >
                <Input
                  value={profileValues.name}
                  maxLength={120}
                  onChange={(event) => {
                    setProfileValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }));
                  }}
                  placeholder="Ваше ім'я"
                  required
                />
              </Field>
            </div>

            <div>
              <Field
                label="Короткий опис"
                hint="2-4 речення про ваш досвід, фокус або навчальні задачі. Максимум 600 символів."
              >
                <Textarea
                  value={profileValues.profileSummary}
                  maxLength={600}
                  onChange={(event) => {
                    setProfileValues((current) => ({
                      ...current,
                      profileSummary: event.target.value,
                    }));
                  }}
                  placeholder="Наприклад: працюю з OSINT, хочу посилити планування місій і систематизувати знання з тактичної медицини."
                />
              </Field>
            </div>

            <div>
              <Field
                label="Навчальні інтереси"
                hint="Вкажіть теми через кому. Можна до 12 інтересів."
              >
                <Input
                  value={profileValues.interestsInput}
                  onChange={(event) => {
                    setProfileValues((current) => ({
                      ...current,
                      interestsInput: event.target.value,
                    }));
                  }}
                  placeholder="OSINT, тактична медицина, планування маршруту"
                />
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-ink">
                  Попередній перегляд інтересів
                </p>
                <p
                  className={`text-xs font-medium ${
                    isInterestsLimitExceeded ? "text-signal" : "text-slate"
                  }`}
                >
                  {interests.length}/12
                </p>
              </div>

              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} tone="field">
                      {interest}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-ink/5 px-4 py-3 text-sm text-slate">
                  Додайте кілька тем, щоб рекомендації краще відображали ваші
                  пріоритети.
                </div>
              )}
            </div>

            {isInterestsLimitExceeded ? (
              <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                Залиште не більше 12 унікальних інтересів.
              </div>
            ) : null}

            {updateProfileMutation.isError ? (
              <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                {getErrorMessage(updateProfileMutation.error)}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-slate">
                <p>
                  {isProfileDirty
                    ? "У формі є незбережені зміни."
                    : "Усі зміни синхронізовано з поточним профілем."}
                </p>
                <p>
                  Після збереження оновимо контекст навчання й AI-рекомендацій.
                </p>
              </div>

              <Button type="submit" disabled={!canSubmitProfile}>
                {updateProfileMutation.isPending ? (
                  <Spinner className="text-white" />
                ) : (
                  <Save className="size-4" />
                )}
                {updateProfileMutation.isPending
                  ? "Зберігаємо..."
                  : "Зберегти зміни"}
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
                  {normalizedName || profileQuery.data.name}
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Роль
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {getRoleLabel(profileQuery.data.role)}
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Інтереси
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {interests.length}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-3 text-white/70">
                <Mail className="size-4" />
                <span className="text-sm">{profileQuery.data.email}</span>
              </div>
            </div>
          </Card>

          <form onSubmit={handleEmailSubmit}>
            <Card className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-field/10 p-3 text-field">
                  <Mail className="size-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Зміна пошти</h2>
                  <p className="text-sm text-slate">
                    Оновіть адресу, яку використовуєте для входу в акаунт.
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] bg-ink/5 px-4 py-4 text-sm text-slate">
                Поточна пошта:{" "}
                <span className="font-semibold text-ink">
                  {profileQuery.data.email}
                </span>
              </div>

              <div>
                <Field
                  label="Нова пошта"
                  hint="Вкажіть email-адресу, яка стане новою адресою входу після оновлення."
                >
                  <Input
                    type="email"
                    value={emailValues.email}
                    onChange={(event) => {
                      setEmailValues({
                        email: event.target.value,
                      });
                    }}
                    placeholder="new.email@example.com"
                    required
                  />
                </Field>
              </div>

              {emailValues.email.trim().length > 0 &&
              !isValidEmail(normalizedNewEmail) ? (
                <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                  Вкажіть коректну email-адресу.
                </div>
              ) : null}

              {normalizedNewEmail === currentEmail &&
              normalizedNewEmail.length > 0 ? (
                <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                  Нова пошта має відрізнятися від поточної.
                </div>
              ) : null}

              {changeEmailMutation.isError ? (
                <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                  {getErrorMessage(changeEmailMutation.error)}
                </div>
              ) : null}

              <Button type="submit" disabled={!canSubmitEmail}>
                {changeEmailMutation.isPending ? (
                  <Spinner className="text-white" />
                ) : (
                  <Mail className="size-4" />
                )}
                {changeEmailMutation.isPending
                  ? "Оновлюємо..."
                  : "Змінити пошту"}
              </Button>
            </Card>
          </form>

          <form onSubmit={handlePasswordSubmit}>
            <Card className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-brass/15 p-3 text-brass">
                  <KeyRound className="size-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Зміна пароля</h2>
                  <p className="text-sm text-slate">
                    Оновіть пароль, який ви використовуєте для входу в акаунт.
                  </p>
                </div>
              </div>

              <div>
                <Field
                  label="Поточний пароль"
                  hint="Потрібен для підтвердження, що саме ви змінюєте пароль."
                >
                  <Input
                    type="password"
                    value={passwordValues.currentPassword}
                    onChange={(event) => {
                      setPasswordValues((current) => ({
                        ...current,
                        currentPassword: event.target.value,
                      }));
                    }}
                    placeholder="Поточний пароль"
                    autoComplete="current-password"
                    required
                  />
                </Field>
              </div>

              <div>
                <Field label="Новий пароль" hint="Від 10 до 128 символів.">
                  <Input
                    type="password"
                    value={passwordValues.newPassword}
                    onChange={(event) => {
                      setPasswordValues((current) => ({
                        ...current,
                        newPassword: event.target.value,
                      }));
                    }}
                    placeholder="Новий пароль"
                    autoComplete="new-password"
                    minLength={10}
                    maxLength={128}
                    required
                  />
                </Field>
              </div>

              <div>
                <Field label="Підтвердження нового пароля">
                  <Input
                    type="password"
                    value={passwordValues.confirmPassword}
                    onChange={(event) => {
                      setPasswordValues((current) => ({
                        ...current,
                        confirmPassword: event.target.value,
                      }));
                    }}
                    placeholder="Повторіть новий пароль"
                    autoComplete="new-password"
                    minLength={10}
                    maxLength={128}
                    required
                  />
                </Field>
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-ink/5 px-4 py-3 text-sm text-ink">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border border-ink/20 accent-field"
                  checked={passwordValues.revokeOtherSessions}
                  onChange={(event) => {
                    setPasswordValues((current) => ({
                      ...current,
                      revokeOtherSessions: event.target.checked,
                    }));
                  }}
                />
                <span>Завершити інші активні сесії після зміни пароля.</span>
              </label>

              {isPasswordTooShort ? (
                <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                  Новий пароль має містити щонайменше 10 символів.
                </div>
              ) : null}

              {isPasswordTooLong ? (
                <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                  Новий пароль має містити не більше 128 символів.
                </div>
              ) : null}

              {passwordValues.newPassword.length > 0 &&
              passwordValues.newPassword === passwordValues.currentPassword ? (
                <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                  Новий пароль має відрізнятися від поточного.
                </div>
              ) : null}

              {isPasswordDirty &&
              passwordValues.confirmPassword.length > 0 &&
              !doPasswordsMatch ? (
                <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                  Підтвердження пароля не збігається з новим паролем.
                </div>
              ) : null}

              {changePasswordMutation.isError ? (
                <div className="rounded-2xl border border-signal/20 bg-signal/10 px-4 py-3 text-sm text-signal">
                  {getErrorMessage(changePasswordMutation.error)}
                </div>
              ) : null}

              <Button type="submit" disabled={!canSubmitPassword}>
                {changePasswordMutation.isPending ? (
                  <Spinner className="text-white" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                {changePasswordMutation.isPending
                  ? "Оновлюємо..."
                  : "Змінити пароль"}
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
