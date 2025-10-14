import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User, UserPayload } from '@shared/types';
/**
 * Fetches a list of all users.
 */
export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: () => api<User[]>('/api/users'),
  });
}
/**
 * Creates a new user.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, UserPayload>({
    mutationFn: (newUser) => api<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
/**
 * Updates an existing user.
 */
export function useUpdateUser(id: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<User, Error, UserPayload>({
    mutationFn: (updatedUser) => api<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedUser),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
/**
 * Deletes a user.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (userId) => api(`/api/users/${userId}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}