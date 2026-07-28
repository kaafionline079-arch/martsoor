import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  date: z.string().min(4, 'Use YYYY-MM-DD'),
  time: z
    .string()
    .min(4, 'Geli saacadda (tusaale 18:00)')
    .regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Format: HH:MM (tusaale 18:00)'),
  location: z.string().min(2, 'Location is required'),
  capacity: z.string().optional(),
  budget: z.string().optional(),
  category: z.string().min(1, 'Pick a category'),
  description: z.string().optional(),
  status: z
    .enum(['draft', 'upcoming', 'live', 'completed', 'cancelled'])
    .optional(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
