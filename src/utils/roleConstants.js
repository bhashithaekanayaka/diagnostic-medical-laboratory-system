// Role constants for Role-Based Access Control (RBAC)
export const ROLES = {
  ADMIN: 'Admin',
  TECHNICIAN: 'Technician',
  STAFF: 'Staff',
  DOCTOR: 'Doctor',
  PATIENT: 'Patient',
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.DOCTOR]: 3,
  [ROLES.TECHNICIAN]: 2,
  [ROLES.STAFF]: 2,
  [ROLES.PATIENT]: 1,
}

// Check if a role has permission to access a resource
export const hasRolePermission = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

// Get all roles as array
export const getAllRoles = () => Object.values(ROLES)

// Check if role is valid
export const isValidRole = (role) => Object.values(ROLES).includes(role)

