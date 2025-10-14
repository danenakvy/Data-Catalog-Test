import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import App from '@/App';
import { HomePage } from '@/pages/HomePage'
import { DatasetDetailPage } from '@/pages/DatasetDetailPage';
import { LoginPage } from '@/pages/LoginPage';
import { AccessManagementPage } from '@/pages/AccessManagementPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { CreateDatasetPage } from '@/pages/CreateDatasetPage';
import { AuditLogPage } from '@/pages/AuditLogPage';
import { MyRequestsPage } from '@/pages/MyRequestsPage';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/datasets/new",
        element: <CreateDatasetPage />,
      },
      {
        path: "/datasets/:datasetId",
        element: <DatasetDetailPage />,
      },
      {
        path: "/datasets/:datasetId/edit",
        element: <CreateDatasetPage />,
      },
      {
        path: "/my-requests",
        element: <MyRequestsPage />,
      },
      {
        path: "/access-management",
        element: <AccessManagementPage />,
      },
      {
        path: "/user-management",
        element: <UserManagementPage />,
      },
      {
        path: "/audit-log",
        element: <AuditLogPage />,
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  }
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)