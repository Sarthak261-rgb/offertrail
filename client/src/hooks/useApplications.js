import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { applicationsApi, statsApi } from '../api/applications.js';

export const queryKeys = {
  applications: ['applications'],
  board: ['applications', 'board'],
  followUps: ['applications', 'follow-ups'],
  list: (params) => ['applications', 'list', params],
  detail: (id) => ['applications', 'detail', id],
  stats: ['stats'],
};

/** Any write can change the board, list, follow-ups and stats, so refresh them all. */
function useInvalidateAll() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.applications }),
      queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
    ]);
}

export const useBoard = () =>
  useQuery({ queryKey: queryKeys.board, queryFn: applicationsApi.board });

export const useFollowUps = () =>
  useQuery({ queryKey: queryKeys.followUps, queryFn: applicationsApi.followUps });

export const useApplicationList = (params) =>
  useQuery({
    queryKey: queryKeys.list(params),
    queryFn: () => applicationsApi.list(params),
    placeholderData: keepPreviousData, // keep the old page visible while the next one loads
  });

export const useApplication = (id) =>
  useQuery({ queryKey: queryKeys.detail(id), queryFn: () => applicationsApi.get(id) });

export const useStats = () => useQuery({ queryKey: queryKeys.stats, queryFn: statsApi.overview });

export function useCreateApplication() {
  const invalidateAll = useInvalidateAll();
  return useMutation({ mutationFn: applicationsApi.create, onSuccess: invalidateAll });
}

export function useUpdateApplication() {
  const invalidateAll = useInvalidateAll();
  return useMutation({
    mutationFn: ({ id, changes }) => applicationsApi.update(id, changes),
    onSuccess: invalidateAll,
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applicationsApi.remove,
    // Skip detail queries: refetching the one just deleted would flash a 404
    // on the detail page before it navigates away.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.applications,
          predicate: (query) => query.queryKey[1] !== 'detail',
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.stats }),
      ]),
  });
}

/** Drag-and-drop status change: update the board instantly, roll back if the server says no. */
export function useMoveApplication() {
  const queryClient = useQueryClient();
  const invalidateAll = useInvalidateAll();

  return useMutation({
    mutationFn: ({ id, status }) => applicationsApi.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.board });
      const previous = queryClient.getQueryData(queryKeys.board);
      queryClient.setQueryData(queryKeys.board, (cards = []) =>
        cards.map((card) => (card._id === id ? { ...card, status } : card)),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      queryClient.setQueryData(queryKeys.board, context?.previous);
      toast.error(`Couldn't move the card: ${error.message}`);
    },
    onSettled: invalidateAll,
  });
}
