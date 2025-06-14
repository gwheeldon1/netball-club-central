import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const phoneSchema = z
  .string()
  .regex(
    /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/,
    'Please enter a valid UK phone number'
  )
  .optional()
  .or(z.literal(''));

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const postCodeSchema = z
  .string()
  .regex(
    /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i,
    'Please enter a valid UK postcode'
  )
  .optional()
  .or(z.literal(''));

// Guardian validation schema
export const guardianSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  relationship: z.string().min(1, 'Relationship is required'),
  emergency_contact_name: nameSchema.optional().or(z.literal('')),
  emergency_contact_phone: phoneSchema,
  emergency_contact_relationship: z.string().optional(),
  medical_conditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  dietary_requirements: z.string().optional(),
  additional_notes: z.string().optional(),
});

// Player validation schema
export const playerSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  date_of_birth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 4 && age <= 18;
    }, 'Player must be between 4 and 18 years old'),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postal_code: postCodeSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  emergency_contact_name: nameSchema,
  emergency_contact_phone: phoneSchema.refine((phone) => phone && phone.length > 0, {
    message: 'Emergency contact phone is required',
  }),
  emergency_contact_relationship: z.string().min(1, 'Emergency contact relationship is required'),
  medical_conditions: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  dietary_requirements: z.string().optional(),
  additional_medical_notes: z.string().optional(),
  team_preference: z.string().optional(),
});

// Team validation schema
export const teamSchema = z.object({
  name: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(100, 'Team name must be less than 100 characters'),
  age_group: z
    .string()
    .min(1, 'Age group is required')
    .regex(/^U\d{1,2}$/, 'Age group must be in format U7, U8, etc.'),
  season_year: z
    .number()
    .min(2020, 'Season year must be 2020 or later')
    .max(new Date().getFullYear() + 2, 'Season year cannot be more than 2 years in the future')
    .optional(),
});

// Event validation schema
export const eventSchema = z.object({
  title: z
    .string()
    .min(3, 'Event title must be at least 3 characters')
    .max(200, 'Event title must be less than 200 characters'),
  event_date: z
    .string()
    .min(1, 'Event date is required')
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, 'Event date cannot be in the past'),
  location: z.string().optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  event_type: z.enum(['training', 'match', 'tournament', 'social', 'other']),
  team_id: z.string().uuid('Invalid team ID').optional(),
  is_home: z.boolean().optional(),
  recurrence_type: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
  recurrence_interval: z.number().min(1).max(365).optional(),
  recurrence_days: z.array(z.string()).optional(),
  recurrence_end_date: z.string().optional(),
});

// Registration form validation schema
export const registrationSchema = z.object({
  guardian: guardianSchema,
  children: z.array(playerSchema).min(1, 'At least one child must be registered'),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  code_of_conduct_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the code of conduct',
  }),
  photo_consent: z.boolean(),
  data_processing_consent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to data processing',
  }),
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailSchema,
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Utility function to validate and sanitize data
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('44')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('07')) {
    return `+44${cleaned.substring(1)}`;
  } else if (cleaned.length === 10 && cleaned.startsWith('7')) {
    return `+44${cleaned}`;
  }
  
  return phone;
}

// Postcode formatting
export function formatPostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  
  if (cleaned.length >= 5) {
    const outward = cleaned.slice(0, -3);
    const inward = cleaned.slice(-3);
    return `${outward} ${inward}`;
  }
  
  return postcode;
}