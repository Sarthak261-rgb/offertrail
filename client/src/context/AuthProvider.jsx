import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { authApi } from '../api/auth.js';
import { AuthContext, ME_QUERY_KEY } from './auth-context.js';

async function fetchCurrentUser() {
  try {
    return await authApi.me();
  } catch (error) {
    if (error.status === 401) return null; // logged out is a normal state, not an error
    throw error;
  }
}

/** The session lives in an httpOnly cookie; the current user is just a cached GET /auth/me. */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data: user, isPending } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
  });

  const login = useCallback(
    async (credentials) => queryClient.setQueryData(ME_QUERY_KEY, await authApi.login(credentials)),
    [queryClient],
  );

  const register = useCallback(
    async (details) => queryClient.setQueryData(ME_QUERY_KEY, await authApi.register(details)),
    [queryClient],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    queryClient.clear(); // drop every cached query from the previous user
    queryClient.setQueryData(ME_QUERY_KEY, null);
  }, [queryClient]);

  const value = useMemo(
    () => ({ user: user ?? null, isLoading: isPending, login, register, logout }),
    [user, isPending, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
