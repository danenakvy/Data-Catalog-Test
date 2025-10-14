import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '@/hooks/use-auth';
import { useDataset } from '@/hooks/use-datasets';
import { useMyRequests } from '@/hooks/use-access-requests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Lock, Mail, User, Calendar, Tag, Globe, FileText, RefreshCw, GitBranch, ShieldCheck, AlertTriangle, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { RequestAccessDialog } from '@/components/RequestAccessDialog';
import { api } from '@/lib/api-client';
import { useMutation } from '@tanstack/react-query';
export function DatasetDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const { user } = useAuthStore();
  const { data: dataset, isLoading: isLoadingDataset, isError, error } = useDataset(datasetId);
  const { data: myRequests, isLoading: isLoadingRequests } = useMyRequests();
  const [isRequestAccessOpen, setIsRequestAccessOpen] = useState(false);
  const downloadMutation = useMutation({
    mutationFn: (id: string) => api<{ url: string }>(`/api/datasets/${id}/download`),
    onSuccess: (data) => {
      toast.success('Download started!', { description: `File will be downloaded from: ${data.url}` });
      // In a real app, you would trigger the download here, e.g., window.location.href = data.url;
    },
    onError: (err) => {
      toast.error('Download failed', { description: err.message });
    },
  });
  const myRequestForThisDataset = useMemo(() => {
    if (!myRequests || !datasetId) return null;
    return myRequests.find(req => req.datasetId === datasetId);
  }, [myRequests, datasetId]);
  if (isLoadingDataset || isLoadingRequests) {
    return <DatasetDetailSkeleton />;
  }
  if (isError) {
    return (
      <div className="text-center py-16 max-w-2xl mx-auto">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Failed to load dataset</h2>
        <p className="text-muted-foreground mt-2 mb-4">{error?.message || 'The dataset you are looking for could not be loaded.'}</p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Link>
        </Button>
      </div>
    );
  }
  if (!dataset) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold">Dataset not found</h2>
        <p className="text-muted-foreground mt-2">The dataset you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Catalog</Link>
        </Button>
      </div>
    );
  }
  const isDataOwnerOrAdmin = user?.role === 'Admin' || user?.role === 'Data Owner';
  const isPublic = dataset.visibility === 'Public';
  const hasApprovedRequest = myRequestForThisDataset?.status === 'Approved';
  const canDownload = isPublic || isDataOwnerOrAdmin || hasApprovedRequest;
  const renderActionPanel = () => {
    let actionContent;
    if (canDownload) {
      actionContent = (
        <Button className="w-full" onClick={() => downloadMutation.mutate(dataset.id)} disabled={downloadMutation.isPending}>
          {downloadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Download
        </Button>
      );
    } else if (myRequestForThisDataset) {
      const { status } = myRequestForThisDataset;
      if (status === 'Pending') {
        actionContent = <div className="flex items-center justify-center p-3 rounded-md bg-secondary text-secondary-foreground text-sm"><Clock className="mr-2 h-4 w-4" />Access Request Pending</div>;
      } else { // Denied
        actionContent = <div className="flex items-center justify-center p-3 rounded-md bg-destructive/10 text-destructive text-sm"><XCircle className="mr-2 h-4 w-4" />Access Request Denied</div>;
      }
    } else { // Private and no request yet
      actionContent = (
        <Button className="w-full" onClick={() => setIsRequestAccessOpen(true)}>
          <Lock className="mr-2 h-4 w-4" /> Request Access
        </Button>
      );
    }
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {actionContent}
            {hasApprovedRequest && <p className="text-xs text-muted-foreground text-center mt-2">Your access is approved.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><GitBranch className="h-4 w-4 text-muted-foreground" /> Version: {dataset.metadata.version}</li>
              <li className="flex items-center gap-3"><RefreshCw className="h-4 w-4 text-muted-foreground" /> Updated: {format(new Date(dataset.updatedAt), 'PPP')}</li>
              <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-muted-foreground" /> License: {dataset.metadata.license}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  };
  const metadataItems = [
    { icon: User, label: 'Publisher', value: dataset.metadata.publisher },
    { icon: Mail, label: 'Contact', value: dataset.metadata.contact_email, isMail: true },
    { icon: Globe, label: 'Geographic Coverage', value: dataset.metadata.coverage_geographic },
    { icon: Calendar, label: 'Time Coverage', value: `${format(new Date(dataset.metadata.coverage_time.start_date), 'yyyy-MM-dd')} to ${format(new Date(dataset.metadata.coverage_time.end_date), 'yyyy-MM-dd')}` },
    { icon: RefreshCw, label: 'Update Frequency', value: dataset.metadata.update_frequency, isBadge: true },
  ];
  return (
    <div className="max-w-7xl mx-auto">
      <RequestAccessDialog
        datasetId={dataset.id}
        datasetTitle={dataset.title}
        open={isRequestAccessOpen}
        onOpenChange={setIsRequestAccessOpen}
      />
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </Link>
      <div className="space-y-2 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight">{dataset.title}</h1>
          <Badge variant={dataset.visibility === 'Public' ? 'secondary' : 'outline'}>{dataset.visibility}</Badge>
        </div>
        <p className="text-lg text-muted-foreground">{dataset.description}</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {metadataItems.map(item => (
                    <TableRow key={item.label}>
                      <TableCell className="font-medium w-1/3 flex items-center gap-2 text-muted-foreground"><item.icon className="h-4 w-4" /> {item.label}</TableCell>
                      <TableCell>
                        {item.isMail ? <a href={`mailto:${item.value}`} className="text-primary hover:underline">{item.value}</a> :
                         item.isBadge ? <Badge variant="outline" className="capitalize">{item.value}</Badge> :
                         item.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-medium text-sm flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /> Keywords:</span>
            {dataset.metadata.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-medium text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Categories:</span>
            {dataset.metadata.categories.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            {renderActionPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}
function DatasetDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-2 mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-3/5" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-6 w-4/5" />
      </div>
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            <Card>
              <CardHeader><Skeleton className="h-8 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-10 w-full" /></CardContent>
            </Card>
            <Card>
              <CardHeader><Skeleton className="h-8 w-24" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}