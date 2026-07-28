import type { EventItem } from '@/types';
import type { TranslationKey } from '@/i18n/dictionaries';

export type EventCategoryId =
  | 'wedding'
  | 'graduation'
  | 'seminars'
  | 'trainings'
  | 'tourism'
  | 'all';

export type EventCategoryOption = {
  id: Exclude<EventCategoryId, 'all'>;
  labelKey: TranslationKey;
  emoji: string;
  /** Stored in DB `event_type` column */
  dbValue: string;
};

export const EVENT_CATEGORY_OPTIONS: EventCategoryOption[] = [
  { id: 'wedding', labelKey: 'catWedding', emoji: '💍', dbValue: 'Wedding' },
  {
    id: 'graduation',
    labelKey: 'catGraduation',
    emoji: '🎓',
    dbValue: 'Graduation',
  },
  { id: 'seminars', labelKey: 'catSeminars', emoji: '🎤', dbValue: 'Seminars' },
  {
    id: 'trainings',
    labelKey: 'catTrainings',
    emoji: '📚',
    dbValue: 'Trainings',
  },
  { id: 'tourism', labelKey: 'catTourism', emoji: '🧳', dbValue: 'Tourism' },
];

const CATEGORY_KEYWORDS: Record<Exclude<EventCategoryId, 'all'>, string[]> = {
  wedding: ['wedding', 'aroos'],
  graduation: ['graduation', 'qalin', 'qalin-jabin'],
  seminars: ['seminar', 'siminaar', 'seminars'],
  trainings: ['training', 'tababar', 'trainings'],
  tourism: ['tourism', 'dalxiis', 'travel'],
};

export function getCategoryOption(
  value?: string | null,
): EventCategoryOption | undefined {
  if (!value) return undefined;
  const raw = value.toLowerCase();
  return EVENT_CATEGORY_OPTIONS.find(
    (c) =>
      c.id === raw ||
      c.dbValue.toLowerCase() === raw ||
      CATEGORY_KEYWORDS[c.id].some((k) => raw.includes(k)),
  );
}

export function matchesEventCategory(
  event: EventItem,
  categoryId: EventCategoryId,
): boolean {
  if (categoryId === 'all') return true;
  const option = EVENT_CATEGORY_OPTIONS.find((c) => c.id === categoryId);
  if (!option) return true;
  const raw = (event.category ?? 'general').toLowerCase();
  if (raw === option.dbValue.toLowerCase() || raw === option.id) return true;
  const keywords = CATEGORY_KEYWORDS[categoryId];
  return keywords.some((k) => raw.includes(k));
}

export function filterEventsByCategory<T extends EventItem>(
  events: T[],
  categoryId: EventCategoryId,
): T[] {
  if (categoryId === 'all') return events;
  return events.filter((e) => matchesEventCategory(e, categoryId));
}

/** Wedding events are invitation-based (not marketplace tickets). */
export function isWeddingCategory(value?: string | null): boolean {
  return getCategoryOption(value)?.id === 'wedding';
}
