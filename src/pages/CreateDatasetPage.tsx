import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useDataset, useCreateDataset, useUpdateDataset } from '@/hooks/use-datasets';
import { toast } from 'sonner';
const datasetSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  visibility: z.enum(['Public', 'Private']),
  metadata: z.object({
    keywords: z.string().min(1, 'At least one keyword is required'),
    categories: z.string().min(1, 'At least one category is required'),
    publisher: z.string().min(2, 'Publisher is required'),
    contact_email: z.string().email('Invalid email address'),
    coverage_geographic: z.string().min(2, 'Geographic coverage is required'),
    coverage_time: z.object({
      start_date: z.date(),
      end_date: z.date(),
    }),
    license: z.string().min(2, 'License is required'),
    update_frequency: z.enum(['one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'annual']),
    version: z.string().min(1, 'Version is required'),
  }),
});
type DatasetFormValues = z.infer<typeof datasetSchema>;
export function CreateDatasetPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!datasetId;
  const { data: existingDataset, isLoading: isLoadingDataset } = useDataset(datasetId);
  const createDataset = useCreateDataset();
  const updateDataset = useUpdateDataset(datasetId);
  const form = useForm<DatasetFormValues>({
    resolver: zodResolver(datasetSchema),
    defaultValues: {
      title: '',
      description: '',
      visibility: 'Private',
      metadata: {
        keywords: '',
        categories: '',
        publisher: '',
        contact_email: '',
        coverage_geographic: '',
        license: '',
        update_frequency: 'one-time',
        version: '1.0.0',
      },
    },
  });
  useEffect(() => {
    if (isEditMode && existingDataset) {
      form.reset({
        title: existingDataset.title,
        description: existingDataset.description,
        visibility: existingDataset.visibility,
        metadata: {
          ...existingDataset.metadata,
          keywords: existingDataset.metadata.keywords.join(', '),
          categories: existingDataset.metadata.categories.join(', '),
          coverage_time: {
            start_date: new Date(existingDataset.metadata.coverage_time.start_date),
            end_date: new Date(existingDataset.metadata.coverage_time.end_date),
          },
        },
      });
    }
  }, [isEditMode, existingDataset, form]);
  const onSubmit = (data: DatasetFormValues) => {
    const payload = {
      ...data,
      metadata: {
        ...data.metadata,
        keywords: data.metadata.keywords.split(',').map(k => k.trim()),
        categories: data.metadata.categories.split(',').map(c => c.trim()),
      },
    };
    const mutation = isEditMode ? updateDataset : createDataset;
    mutation.mutate(payload as any, {
      onSuccess: (result) => {
        toast.success(`Dataset successfully ${isEditMode ? 'updated' : 'created'}`);
        navigate(`/datasets/${result.id}`);
      },
      onError: (error) => {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} dataset`, {
          description: error.message,
        });
      },
    });
  };
  if (isEditMode && isLoadingDataset) {
    return <div>Loading dataset...</div>;
  }
  const isSubmitting = createDataset.isPending || updateDataset.isPending;
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{isEditMode ? 'Edit Dataset' : 'Create Dataset'}</h1>
        <p className="text-lg text-muted-foreground">
          {isEditMode ? 'Update the metadata for this dataset.' : 'Define and publish a new dataset to the catalog.'}
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Core Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="visibility" render={({ field }) => (
                <FormItem><FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Public">Public</SelectItem><SelectItem value="Private">Private</SelectItem></SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Metadata</CardTitle><CardDescription>All fields are required.</CardDescription></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="metadata.publisher" render={({ field }) => (
                <FormItem><FormLabel>Publisher</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="metadata.contact_email" render={({ field }) => (
                <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="metadata.keywords" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Keywords (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="metadata.categories" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Categories (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="metadata.coverage_geographic" render={({ field }) => (
                <FormItem><FormLabel>Geographic Coverage</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="metadata.coverage_time.start_date" render={({ field }) => (
                  <FormItem><FormLabel>Coverage Start</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                      <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="metadata.coverage_time.end_date" render={({ field }) => (
                  <FormItem><FormLabel>Coverage End</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                      <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                    </Popover><FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="metadata.update_frequency" render={({ field }) => (
                <FormItem><FormLabel>Update Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="one-time">One-time</SelectItem><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem><SelectItem value="quarterly">Quarterly</SelectItem><SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="metadata.license" render={({ field }) => (
                <FormItem><FormLabel>License</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="metadata.version" render={({ field }) => (
                <FormItem><FormLabel>Version</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Save Changes' : 'Create Dataset'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}