import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number');
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long');

// User validation schemas
export const userCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  roles: z.array(z.enum(['parent', 'coach', 'manager', 'admin'])).min(1, 'At least one role is required'),
});

export const userUpdateSchema = userCreateSchema.partial();

// Child validation schemas
export const childCreateSchema = z.object({
  name: nameSchema,
  dateOfBirth: z.string().date('Please enter a valid date'),
  medicalInfo: z.string().optional(),
  notes: z.string().optional(),
  teamId: z.string().uuid('Invalid team ID').optional(),
  parentId: z.string().uuid('Invalid parent ID'),
});

export const childUpdateSchema = childCreateSchema.partial().omit({ parentId: true });

// Team validation schemas
export const teamCreateSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name is too long'),
  ageGroup: z.string().min(1, 'Age group is required'),
  category: z.enum(['Junior', 'Senior', 'Mixed']),
  description: z.string().optional(),
});

export const teamUpdateSchema = teamCreateSchema.partial();

// Event validation schemas
export const eventCreateSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters').max(100, 'Event name is too long'),
  date: z.string().date('Please enter a valid date'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
  location: z.string().min(2, 'Location must be at least 2 characters').max(200, 'Location is too long'),
  eventType: z.enum(['training', 'match', 'other']),
  teamId: z.string().uuid('Invalid team ID'),
  notes: z.string().optional(),
  opponent: z.string().optional(),
  recurring: z.boolean().optional(),
  recurrencePattern: z.string().optional(),
});

export const eventUpdateSchema = eventCreateSchema.partial().omit({ teamId: true });

// Attendance validation schemas
export const attendanceUpdateSchema = z.object({
  status: z.enum(['present', 'absent', 'injured', 'late']),
  rsvp: z.enum(['going', 'not_going', 'maybe']),
});

// Helper function to validate data with proper error handling
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Helper function to sanitize input strings
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML-like characters
    .replace(/\s+/g, ' '); // Replace multiple spaces with single space
}

// Helper function to format phone numbers
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return as-is if format is not recognized
}