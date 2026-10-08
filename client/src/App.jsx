import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { GuestRoute, ProtectedRoute } from './components/RouteGuards.jsx';
import { PageSpinner } from './components/ui.jsx';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { BoardPage } from './pages/BoardPage.jsx';
import { ListPage } from './pages/ListPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// The charting library is the largest dependency, so it's only loaded when Stats is opened.
const StatsPage = lazy(() =>
  import('./pages/StatsPage.jsx').then((module) => ({ default: module.StatsPage })),
);

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<BoardPage />} />
          <Route path="applications" element={<ListPage />} />
          <Route path="applications/:id" element={<ApplicationDetailPage />} />
          <Route
            path="stats"
            element={
              <Suspense fallback={<PageSpinner />}>
                <StatsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
