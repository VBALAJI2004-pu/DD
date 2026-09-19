import React from 'react';
import { useRole } from '../contexts/RoleContext';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, requiredPermission, allowedRoles }) => {
  const { userRole, permissions } = useRole();

  // Check by permission
  if (requiredPermission && !permissions[requiredPermission]) {
    return <Navigate to="/" replace />;
  }

  // Check by role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
