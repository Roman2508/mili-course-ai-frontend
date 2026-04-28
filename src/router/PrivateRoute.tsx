import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { ErrorState, LoadingState } from '@/components/ui/page-state'
import { useAuth } from '@/features/auth/hooks/use-auth'

interface PrivateRouteProps extends PropsWithChildren {
  requireAdmin?: boolean
}

export function PrivateRoute({ children, requireAdmin = false }: PrivateRouteProps) {
  const { isAuthenticated, isAdmin, isReady, error, refetchSession } = useAuth()

  if (!isReady) {
    return <LoadingState title="Відновлюємо сесію" description="Перевіряємо поточну сесію." />
  }

  if (error) {
    return (
      <ErrorState
        title="Не вдалося перевірити сесію"
        description={error.message}
        onRetry={() => {
          void refetchSession()
        }}
      />
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/courses" replace />
  }

  return <>{children}</>
}
