import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

export default AdminRoute; 