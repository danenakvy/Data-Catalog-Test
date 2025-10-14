import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/hooks/use-auth';
import { Toaster } from "@/components/ui/sonner";
export function App() {
  const user = useAuthStore(state => state.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <AppLayout>
      <Outlet />
      <Toaster richColors closeButton />
    </AppLayout>
  );
}
export default App;