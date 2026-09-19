// Role-based access control middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log('🛡️ requireRole middleware called, user role:', req.user?.role, 'allowed:', allowedRoles);
      const userRole = req.user?.role;
      
      if (!userRole) {
        console.log('❌ No role found for user');
        return res.status(401).json({ 
          error: "Access denied. No role found." 
        });
      }
      
      if (!allowedRoles.includes(userRole)) {
        console.log('❌ Role not allowed:', userRole, 'required:', allowedRoles);
        return res.status(403).json({ 
          error: "Access denied. Insufficient permissions." 
        });
      }
      
      console.log('✅ Role check passed');
      next();
    } catch (error) {
      console.log('❌ Role verification error:', error.message);
      return res.status(500).json({ 
        error: "Server error in role verification." 
      });
    }
  };
};

// Specific role middleware functions
export const requireAdmin = requireRole(['admin']);
export const requireAccountantOrAdmin = requireRole(['accountant', 'admin']);
export const requireStaffOrAbove = requireRole(['staff', 'accountant', 'admin']);

// Permission checking utilities
export const canEdit = (userRole) => {
  return ['admin'].includes(userRole);
};

export const canDelete = (userRole) => {
  return ['admin'].includes(userRole);
};

export const canManageUsers = (userRole) => {
  return ['admin'].includes(userRole);
};

export const canManageCategories = (userRole) => {
  return ['admin'].includes(userRole);
};

export const canViewAllData = (userRole) => {
  return ['accountant', 'admin'].includes(userRole);
};

export const canAddExpense = (userRole) => {
  return ['accountant', 'admin'].includes(userRole);
};

export const canAddSale = (userRole) => {
  return ['staff', 'accountant', 'admin'].includes(userRole);
};
