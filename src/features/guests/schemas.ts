import { z } from 'zod';

export const guestRegisterSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(8, 'Enter a valid phone'),
  eventId: z.string().min(1, 'Select an event'),
  category: z.enum([
    'vip',
    'general',
    'family',
    'media',
    'staff',
    'sponsor',
    'speaker',
  ]),
  table: z.string().optional(),
  notes: z.string().optional(),
});

export type GuestRegisterValues = z.infer<typeof guestRegisterSchema>;
