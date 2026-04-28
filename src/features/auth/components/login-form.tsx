import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useLogin } from '@/features/auth/hooks/use-login'

export function LoginForm() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const [values, setValues] = useState({ email: '', password: '' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await loginMutation.mutateAsync(values)
    navigate('/courses')
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <section className="rounded-[32px] w-full max-w-lg bg-ink px-6 py-8 text-white text-center shadow-panel sm:px-8 sm:py-10">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Mili Course AI</h1>
      </section>

      <Card className="self-center p-6 sm:p-8 w-full max-w-lg">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Увійти в систему</h2>

          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <Field label="Email">
              <Input
                type="email"
                value={values.email}
                onChange={(event) => {
                  setValues((current) => ({ ...current, email: event.target.value }))
                }}
                placeholder="admin@mili.local"
                required
              />
            </Field>

            <Field label="Пароль">
              <Input
                type="password"
                value={values.password}
                onChange={(event) => {
                  setValues((current) => ({ ...current, password: event.target.value }))
                }}
                placeholder="********"
                required
              />
            </Field>

            <Button className="mt-2" fullWidth type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <Spinner className="text-white" /> : null}
              Увійти
            </Button>

            <div className="pt-2 text-center text-sm text-muted">
              Немає акаунту?{' '}
              <Link className="font-semibold text-field hover:underline" to="/register">
                Створити
              </Link>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
