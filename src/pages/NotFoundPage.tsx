import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-2xl space-y-5 p-8">
      <p className="text-xs uppercase tracking-[0.18em] text-slate">404</p>
      <h1 className="text-4xl font-semibold">Сторінку не знайдено</h1>
      <p className="text-sm">Перевірте маршрут або поверніться до основного каталогу курсів.</p>
      <Button asChild>
        <Link to="/courses">До каталогу</Link>
      </Button>
    </Card>
  );
}
