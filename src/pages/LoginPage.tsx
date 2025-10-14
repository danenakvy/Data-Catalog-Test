import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/hooks/use-auth';
import { MOCK_USERS } from '@shared/mock-data';
import { DatabaseZap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const handleLogin = (role: 'Admin' | 'Data Owner' | 'Contributor' | 'Viewer') => {
    const user = MOCK_USERS.find((u) => u.role === role);
    if (user) {
      login(user);
      navigate('/');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ThemeToggle className="absolute top-4 right-4" />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <DatabaseZap className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Nexus Data Catalog</CardTitle>
          <CardDescription>Select a role to sign in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => handleLogin('Viewer')}>
            Sign in as Viewer
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => handleLogin('Contributor')}>
            Sign in as Contributor
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => handleLogin('Data Owner')}>
            Sign in as Data Owner
          </Button>
          <Button className="w-full" variant="outline" onClick={() => handleLogin('Admin')}>
            Sign in as Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}