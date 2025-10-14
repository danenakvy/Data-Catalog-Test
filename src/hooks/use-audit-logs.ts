import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AuditLog, User } from '@shared/types';
export type AuditLogWithUser = AuditLog & { user: User };
/**
 * Fetches a list of all audit logs.
 */
export function useAuditLogs() {
  return useQuery<AuditLogWithUser[], Error>({
    queryKey: ['audit-logs'],
    queryFn: () => api<AuditLogWithUser[]>('/api/audit-logs'),
  });
}