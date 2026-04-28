export type AuthRole = 'student' | 'admin';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterValues extends AuthCredentials {
  name: string;
}

export interface ChangeEmailValues {
  email: string;
}

export interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions: boolean;
}
