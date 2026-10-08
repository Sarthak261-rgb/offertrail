import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App.jsx';
import { ME_QUERY_KEY } from './context/auth-context.js';
import { AuthProvider } from './context/AuthProvider.jsx';
import './index.css';

const queryClient = new QueryClient({
  // If any request finds the session expired, mark the user as logged out;
  // ProtectedRoute then redirects to /login.
  queryCache: new QueryCache({
    onError: (error) => {
      if (error.status === 401) queryClient.setQueryData(ME_QUERY_KEY, null);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Retrying a 4xx won't change the answer; retry network and server errors once.
      retry: (failureCount, error) => !(error.status >= 400 && error.status < 500) && failureCount < 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
