import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits');
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePhone = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success;
};

export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};