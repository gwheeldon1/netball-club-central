import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (date: string | Date, formatString: string = 'PP'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return 'Invalid date';
    }
    return format(dateObj, formatString);
  } catch {
    return 'Invalid date';
  }
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'p');
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'PPp');
};