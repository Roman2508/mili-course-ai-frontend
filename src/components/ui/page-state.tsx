import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PageStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  type?: 'center' | 'top'
}

function PageStateBase({ title, description, action, icon, type = 'top' }: PageStateProps) {
  return (
    <Card
      className={cn(
        'flex min-h-[220px] flex-col items-start justify-center gap-4 border-dashed bg-white/70',
        type === 'center' ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : '',
      )}
    >
      <div className="rounded-2xl bg-ink/5 p-3 text-ink">{icon}</div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="max-w-xl text-sm">{description}</p>
      </div>
      {action}
    </Card>
  )
}

export function LoadingState({ title = 'Завантаження...', description = 'Готуємо дані для цієї сторінки.' }) {
  return (
    <PageStateBase
      title={title}
      description={description}
      icon={<LoaderCircle className="size-5 animate-spin" />}
      type="center"
    />
  )
}

export function EmptyState({
  title = 'Поки порожньо',
  description = "Дані ще не з'явилися для цього розділу.",
  action,
}: Omit<PageStateProps, 'icon'>) {
  return <PageStateBase title={title} description={description} action={action} icon={<Inbox className="size-5" />} />
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Не вдалося завантажити дані',
  description = 'Спробуйте повторити запит або перевірте доступність backend API.',
  onRetry,
}: ErrorStateProps) {
  return (
    <PageStateBase
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Повторити
          </Button>
        ) : undefined
      }
      icon={<AlertTriangle className="size-5" />}
      type="center"
    />
  )
}
