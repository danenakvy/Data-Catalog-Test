import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, History } from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { format } from 'date-fns';
export function AuditLogPage() {
  const { data: logs, isLoading, isError, error } = useAuditLogs();
  const renderContent = () => {
    if (isLoading) {
      return [...Array(10)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        </TableRow>
      ));
    }
    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-16">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-destructive">Failed to load audit logs</h3>
            <p className="text-muted-foreground mt-2">{error?.message || 'An unexpected error occurred.'}</p>
          </TableCell>
        </TableRow>
      );
    }
    if (!logs || logs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center py-16">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No Audit Logs Found</h3>
            <p className="text-muted-foreground mt-2">No actions have been recorded in the system yet.</p>
          </TableCell>
        </TableRow>
      );
    }
    return logs.map((log) => (
      <TableRow key={log.id}>
        <TableCell className="font-medium">{format(new Date(log.timestamp), 'PPP p')}</TableCell>
        <TableCell>{log.user?.name || 'System'}</TableCell>
        <TableCell>
          <Badge variant="secondary" className="capitalize">{log.entity}</Badge>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{log.action}</Badge>
        </TableCell>
        <TableCell className="text-muted-foreground text-xs font-mono">{log.entityId}</TableCell>
      </TableRow>
    ));
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Audit Log</h1>
        <p className="text-lg text-muted-foreground">
          A complete history of all actions performed within the data catalog.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Events</CardTitle>
          <CardDescription>All recorded user and system actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderContent()}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}