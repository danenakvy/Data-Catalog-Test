import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { useAccessRequests, useApproveAccessRequest, useDenyAccessRequest, AccessRequestWithUser } from '@/hooks/use-access-requests';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
export function AccessManagementPage() {
  const { data: requests, isLoading, isError, error } = useAccessRequests();
  const approveMutation = useApproveAccessRequest();
  const denyMutation = useDenyAccessRequest();
  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success('Request approved.'),
      onError: (err) => toast.error('Failed to approve request.', { description: err.message }),
    });
  };
  const handleDeny = (id: string) => {
    denyMutation.mutate(id, {
      onSuccess: () => toast.success('Request denied.'),
      onError: (err) => toast.error('Failed to deny request.', { description: err.message }),
    });
  };
  const renderContent = () => {
    if (isLoading) {
      return <>{[...Array(3)].map((_, i) => <RequestCardSkeleton key={i} />)}</>;
    }
    if (isError) {
      return (
        <div className="text-center py-16 col-span-full">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-destructive">Failed to load requests</h3>
          <p className="text-muted-foreground mt-2">{error?.message || 'An unexpected error occurred.'}</p>
        </div>
      );
    }
    if (!requests || requests.length === 0) {
      return (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center text-center py-24">
            <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">All Caught Up</h3>
            <p className="text-muted-foreground mt-2">There are no pending access requests to review.</p>
          </CardContent>
        </Card>
      );
    }
    return requests.map((request) => (
      <RequestCard
        key={request.id}
        request={request}
        onApprove={handleApprove}
        onDeny={handleDeny}
        isProcessing={approveMutation.isPending || denyMutation.isPending}
      />
    ));
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Access Management</h1>
        <p className="text-lg text-muted-foreground">
          Review and respond to pending access requests for datasets you own.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderContent()}
      </div>
    </div>
  );
}
interface RequestCardProps {
  request: AccessRequestWithUser;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
  isProcessing: boolean;
}
function RequestCard({ request, onApprove, onDeny, isProcessing }: RequestCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request for: {request.datasetId}</CardTitle>
        <CardDescription>
          From: {request.requestor.name} ({request.requestor.email})
          <span className="mx-2">•</span>
          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm">Organization</h4>
          <p className="text-muted-foreground text-sm">{request.organization}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm">Purpose</h4>
          <p className="text-muted-foreground text-sm">{request.purpose}</p>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" size="sm" onClick={() => onDeny(request.id)} disabled={isProcessing}>
            <X className="h-4 w-4 mr-2" /> Deny
          </Button>
          <Button size="sm" onClick={() => onApprove(request.id)} disabled={isProcessing}>
            <Check className="h-4 w-4 mr-2" /> Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
function RequestCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}