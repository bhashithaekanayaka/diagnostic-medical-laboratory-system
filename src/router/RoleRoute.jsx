import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/roleConstants'
import Loader from '../components/ui/Loader'

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user role is in allowed roles
  if (!allowedRoles.includes(userRole)) {
    // Redirect based on role
    if (userRole === ROLES.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />
    } else if (userRole === ROLES.DOCTOR) {
      return <Navigate to="/doctor/dashboard" replace />
    } else if (userRole === ROLES.TECHNICIAN || userRole === ROLES.STAFF) {
      return <Navigate to="/staff/dashboard" replace />
    } else if (userRole === ROLES.PATIENT) {
      return <Navigate to="/patient/portal" replace />
    } else {
      return <Navigate to="/login" replace />
    }
  }

  return children
}

export default RoleRoute

