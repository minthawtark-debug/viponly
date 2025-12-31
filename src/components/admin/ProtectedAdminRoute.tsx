import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // Check if user has temporary admin access via token
  const hasTempAccess = sessionStorage.getItem('admin_access') === 'true';

  if (!user && !hasTempAccess) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin && !hasTempAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-primary mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
