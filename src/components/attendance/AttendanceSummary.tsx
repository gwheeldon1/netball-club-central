import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Clock, User } from 'lucide-react';

interface AttendanceSummaryProps {
  responses: Array<{
    attendance_status: string;
  }>;
}

const ATTENDANCE_OPTIONS = [
  { value: 'present', label: 'Present', icon: CheckCircle, color: 'text-green-600' },
  { value: 'absent', label: 'Absent', icon: XCircle, color: 'text-red-600' },
  { value: 'injured', label: 'Injured', icon: AlertTriangle, color: 'text-yellow-600' },
  { value: 'late', label: 'Late', icon: Clock, color: 'text-orange-600' },
  { value: 'not_marked', label: 'Not Marked', icon: User, color: 'text-gray-400' }
];

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ responses }) => {
  const getAttendanceSummary = () => {
    return responses.reduce((acc, response) => {
      const status = response.attendance_status || 'not_marked';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const summary = getAttendanceSummary();

  return (
    <div className="flex gap-2">
      {ATTENDANCE_OPTIONS.slice(0, 4).map(option => {
        const count = summary[option.value] || 0;
        const Icon = option.icon;
        return (
          <Badge key={option.value} variant="outline" className="flex items-center gap-1">
            <Icon className={`w-3 h-3 ${option.color}`} />
            {count}
          </Badge>
        );
      })}
    </div>
  );
};