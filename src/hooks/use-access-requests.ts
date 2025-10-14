import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AccessRequest, User, Dataset } from '@shared/types';
export type AccessRequestWithUser = AccessRequest & { requestor: User };
export type MyRequestWithDataset = AccessRequest & { dataset: Dataset };
/**
 * Fetches a list of all pending access requests.
 */
export function useAccessRequests() {
  return useQuery<AccessRequestWithUser[], Error>({
    queryKey: ['access-requests'],
    queryFn: () => api<AccessRequestWithUser[]>('/api/access-requests'),
  });
}
/**
 * Fetches a list of access requests for the current user.
 */
export function useMyRequests() {
  return useQuery<MyRequestWithDataset[], Error>({
    queryKey: ['my-requests'],
    queryFn: () => api<MyRequestWithDataset[]>('/api/my-requests'),
  });
}
/**
 * Creates a new access request for a dataset.
 */
export function useCreateAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ datasetId, data }: { datasetId: string; data: { purpose: string; organization: string } }) =>
      api(`/api/datasets/${datasetId}/request-access`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
  });
}
/**
 * Approves an access request.
 */
export function useApproveAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api(`/api/access-requests/${requestId}/approve`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
  });
}
/**
 * Denies an access request.
 */
export function useDenyAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      api(`/api/access-requests/${requestId}/deny`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
  });
}