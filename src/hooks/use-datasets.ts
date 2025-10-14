import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Dataset, CreateDatasetPayload } from '@shared/types';
/**
 * Fetches a list of all datasets.
 * @returns A react-query query object for the datasets list.
 */
export function useDatasets() {
  return useQuery<Dataset[], Error>({
    queryKey: ['datasets'],
    queryFn: () => api<Dataset[]>('/api/datasets'),
  });
}
/**
 * Fetches a single dataset by its ID.
 * @param id The ID of the dataset to fetch. The query is disabled if the ID is undefined.
 * @returns A react-query query object for the single dataset.
 */
export function useDataset(id: string | undefined) {
  return useQuery<Dataset, Error>({
    queryKey: ['dataset', id],
    queryFn: () => api<Dataset>(`/api/datasets/${id}`),
    enabled: !!id, // The query will not execute until the datasetId exists
  });
}
/**
 * Creates a new dataset.
 */
export function useCreateDataset() {
  const queryClient = useQueryClient();
  return useMutation<Dataset, Error, CreateDatasetPayload>({
    mutationFn: (newDataset) => api<Dataset>('/api/datasets', {
      method: 'POST',
      body: JSON.stringify(newDataset),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
  });
}
/**
 * Updates an existing dataset.
 */
export function useUpdateDataset(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<Dataset, Error, Partial<CreateDatasetPayload>>({
    mutationFn: (updatedDataset) => api<Dataset>(`/api/datasets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedDataset),
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset', id] });
    },
  });
}