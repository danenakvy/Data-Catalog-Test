import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateAccessRequest } from '@/hooks/use-access-requests';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
const requestAccessSchema = z.object({
  purpose: z.string().min(10, { message: 'Purpose must be at least 10 characters long.' }),
  organization: z.string().min(2, { message: 'Organization is required.' }),
});
type RequestAccessFormValues = z.infer<typeof requestAccessSchema>;
interface RequestAccessDialogProps {
  datasetId: string;
  datasetTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function RequestAccessDialog({ datasetId, datasetTitle, open, onOpenChange }: RequestAccessDialogProps) {
  const form = useForm<RequestAccessFormValues>({
    resolver: zodResolver(requestAccessSchema),
    defaultValues: {
      purpose: '',
      organization: '',
    },
  });
  const createAccessRequestMutation = useCreateAccessRequest();
  const onSubmit = (data: RequestAccessFormValues) => {
    createAccessRequestMutation.mutate(
      { datasetId, data },
      {
        onSuccess: () => {
          toast.success('Access Request Sent', {
            description: 'The data owner has been notified of your request.',
          });
          onOpenChange(false);
          form.reset();
        },
        onError: (error) => {
          toast.error('Failed to send request', {
            description: error.message || 'An unexpected error occurred.',
          });
        },
      }
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Access to "{datasetTitle}"</DialogTitle>
          <DialogDescription>
            Please provide the following information. The data owner will be notified to review your request.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization / Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Marketing Department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Use</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe how you intend to use this data..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createAccessRequestMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAccessRequestMutation.isPending}>
                {createAccessRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}