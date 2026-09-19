import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const userRole = user?.role || 'staff';

  // Permission checking functions
  const permissions = {
    // Staff permissions
    canAddSale: ['staff', 'accountant', 'admin'].includes(userRole),
    canAddExpense: ['accountant', 'admin'].includes(userRole),
    
    // View permissions
    canViewDashboard: ['staff', 'accountant', 'admin'].includes(userRole),
    canViewFullDashboard: ['accountant', 'admin'].includes(userRole),
    canViewSalesData: ['accountant', 'admin'].includes(userRole),
    canViewExpenseData: ['accountant', 'admin'].includes(userRole),
    
    // Edit/Delete permissions
    canEdit: ['admin'].includes(userRole),
    canDelete: ['admin'].includes(userRole),
    
    // Management permissions
    canManageUsers: ['admin'].includes(userRole),
    canManageCategories: ['admin'].includes(userRole),
    
    // UI permissions
    canSeeActions: ['admin'].includes(userRole),
    canSeeFilters: ['staff', 'accountant', 'admin'].includes(userRole),
    canSeeAllCards: ['accountant', 'admin'].includes(userRole),
    
    // Staff specific
    isStaff: userRole === 'staff',
    isAccountant: userRole === 'accountant',
    isAdmin: userRole === 'admin'
  };

  const value = {
    userRole,
    permissions,
    hasPermission: (permission) => permissions[permission] || false
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
