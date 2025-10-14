import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Inbox, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useMyRequests } from '@/hooks/use-access-requests';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
export function MyRequestsPage() {
  const { data: requests, isLoading, isError, error } = useMyRequests();
  const getStatusBadge = (status: 'Pending' | 'Approved' | 'Denied') => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="mr-1 h-3 w-3" />Approved</Badge>;
      case 'Denied':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Denied</Badge>;
      case 'Pending':
      default:
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
    }
  };
  const renderContent = () => {
    if (isLoading) {
      return [...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-6 w-24" />
          </CardFooter>
        </Card>
      ));
    }
    if (isError) {
      return (
        <div className="text-center py-16 col-span-full">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-destructive">Failed to load your requests</h3>
          <p className="text-muted-foreground mt-2">{error?.message || 'An unexpected error occurred.'}</p>
        </div>
      );
    }
    if (!requests || requests.length === 0) {
      return (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center text-center py-24">
            <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Requests Found</h3>
            <p className="text-muted-foreground mt-2">You haven't requested access to any datasets yet.</p>
            <Button asChild className="mt-4">
              <Link to="/">Browse Catalog</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }
    return requests.map((request) => (
      <Card key={request.id}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              <Link to={`/datasets/${request.dataset.id}`} className="hover:underline hover:text-primary">
                {request.dataset.title}
              </Link>
            </CardTitle>
            {getStatusBadge(request.status)}
          </div>
          <CardDescription>
            Requested {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{request.purpose}</p>
        </CardContent>
      </Card>
    ));
  };
  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">My Access Requests</h1>
        <p className="text-lg text-muted-foreground">
          Track the status of your requests for access to private datasets.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderContent()}
      </div>
    </div>
  );
}