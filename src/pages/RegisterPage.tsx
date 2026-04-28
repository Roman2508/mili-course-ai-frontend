import { Navigate } from 'react-router-dom'
import { ErrorState, LoadingState } from '@/components/ui/page-state'
import { RegisterForm } from '@/features/auth/components/register-form'
import { useAuth } from '@/features/auth/hooks/use-auth'

export default function RegisterPage() {
  const { isAuthenticated, isReady, error, refetchSession } = useAuth()

  if (!isReady) {
    return (
      <div className="min-h-screen px-4 py-4 sm:px-5 relative">
        <div className="mx-auto max-w-[1400px] py-4 lg:py-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <LoadingState title="Відновлюємо сесію" description="Перевіряємо, чи є активна Better Auth сесія." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-4 sm:px-5 relative">
        <div className="mx-auto max-w-[1400px] py-4 lg:py-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <ErrorState
            title="Не вдалося перевірити сесію"
            description={error.message}
            onRetry={() => {
              void refetchSession()
            }}
          />
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/courses" replace />
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-5">
      <div className="mx-auto max-w-[1400px] py-4 lg:py-8">
        <RegisterForm />
      </div>
    </div>
  )
}
