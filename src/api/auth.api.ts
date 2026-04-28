import { authClient } from '@/api/auth-client';
import { ApiError } from '@/api/api-error';
import type {
  AuthCredentials,
  AuthRole,
  AuthSession,
  ChangeEmailValues,
  ChangePasswordValues,
  RegisterValues,
} from '@/types/auth';

interface BetterAuthUser {
  id: string;
  name: string;
  email: string;
  role?: AuthRole | null;
}

interface BetterAuthSessionResponse {
  session: {
    id: string;
    userId: string;
    expiresAt: Date | string;
  };
  user: BetterAuthUser;
}

interface ChangeEmailResponse {
  status: boolean;
  message?: string;
}

function normalizeUserSession(user: BetterAuthUser): AuthSession {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === 'admin' ? 'admin' : 'student',
  };
}

function resolveAuthError(error: unknown, fallback: string): never {
  if (error instanceof Error && error.message.trim().length > 0) {
    throw new ApiError(error.message);
  }

  throw new ApiError(fallback);
}

export async function getCurrentSession() {
  try {
    const result = await authClient.getSession({
      query: {
        disableCookieCache: true,
      },
    });

    if (result.error) {
      if (result.error.status === 401) {
        return null;
      }

      throw new ApiError(
        result.error.message || 'Не вдалося відновити сесію.',
        result.error.status,
      );
    }

    if (!result.data) {
      return null;
    }

    return normalizeUserSession((result.data as BetterAuthSessionResponse).user);
  } catch (error) {
    return resolveAuthError(error, 'Не вдалося відновити сесію.');
  }
}

export async function login(credentials: AuthCredentials) {
  try {
    const result = await authClient.signIn.email({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      callbackURL: new URL('/courses', window.location.origin).toString(),
      rememberMe: true,
    });

    if (result.error) {
      throw new ApiError(
        result.error.message || 'Не вдалося виконати вхід.',
        result.error.status,
      );
    }

    const session = await getCurrentSession();

    if (!session) {
      throw new ApiError(
        'Login succeeded, but the browser did not persist the auth session cookie.',
      );
    }

    return session;
  } catch (error) {
    return resolveAuthError(error, 'Не вдалося виконати вхід.');
  }
}

export async function register(values: RegisterValues) {
  try {
    const result = await authClient.signUp.email({
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      callbackURL: new URL('/courses', window.location.origin).toString(),
    });

    if (result.error) {
      throw new ApiError(
        result.error.message || 'Не вдалося створити акаунт.',
        result.error.status,
      );
    }

    const session = await getCurrentSession();

    if (!session) {
      throw new ApiError(
        'Registration succeeded, but the browser did not persist the auth session cookie.',
      );
    }

    return session;
  } catch (error) {
    return resolveAuthError(error, 'Не вдалося створити акаунт.');
  }
}

export async function logout() {
  try {
    const result = await authClient.signOut();

    if (result.error && result.error.status !== 401) {
      throw new ApiError(
        result.error.message || 'Не вдалося завершити сесію.',
        result.error.status,
      );
    }
  } catch (error) {
    return resolveAuthError(error, 'Не вдалося завершити сесію.');
  }
}

export async function changeEmail(values: ChangeEmailValues) {
  try {
    const result = await authClient.changeEmail({
      newEmail: values.email.trim().toLowerCase(),
      callbackURL: new URL('/profile', window.location.origin).toString(),
    });

    if (result.error) {
      throw new ApiError(
        result.error.message || 'Не вдалося змінити email.',
        result.error.status,
      );
    }

    return (result.data as ChangeEmailResponse | null) ?? {
      status: true,
    };
  } catch (error) {
    return resolveAuthError(error, 'Не вдалося змінити email.');
  }
}

export async function changePassword(values: ChangePasswordValues) {
  try {
    const result = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: values.revokeOtherSessions,
    });

    if (result.error) {
      throw new ApiError(
        result.error.message || 'Не вдалося змінити пароль.',
        result.error.status,
      );
    }

    return result.data;
  } catch (error) {
    return resolveAuthError(error, 'Не вдалося змінити пароль.');
  }
}
