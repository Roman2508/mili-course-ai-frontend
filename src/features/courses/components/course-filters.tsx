import { Search } from 'lucide-react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { DifficultyLevel } from '@/types/course';

interface CourseFiltersProps {
  search: string;
  selectedTag: string;
  selectedDifficulty: DifficultyLevel | 'all';
  availableTags: string[];
  onSearchChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onDifficultyChange: (value: DifficultyLevel | 'all') => void;
}

export function CourseFilters({
  search,
  selectedTag,
  selectedDifficulty,
  availableTags,
  onSearchChange,
  onTagChange,
  onDifficultyChange,
}: CourseFiltersProps) {
  return (
    <div className="app-panel grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
      <Field label="Пошук">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate" />
          <Input
            className="pl-11"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Пошук по назві курсу..."
          />
        </div>
      </Field>

      <Field label="Тег">
        <Select value={selectedTag} onChange={(event) => onTagChange(event.target.value)}>
          <option value="all">Усі теги</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Складність">
        <Select
          value={selectedDifficulty}
          onChange={(event) => onDifficultyChange(event.target.value as DifficultyLevel | 'all')}
        >
          <option value="all">Усі рівні</option>
          <option value="beginner">Початковий</option>
          <option value="intermediate">Середній</option>
          <option value="advanced">Просунутий</option>
        </Select>
      </Field>
    </div>
  );
}
