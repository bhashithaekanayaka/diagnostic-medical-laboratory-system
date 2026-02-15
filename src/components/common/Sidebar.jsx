import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/roleConstants'

const Sidebar = () => {
  const { userRole } = useAuth()

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/inventory', label: 'Inventory', icon: '📦' },
    { path: '/admin/reports', label: 'Reports', icon: '📄' },
  ]

  const doctorMenuItems = [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/doctor/pending-approvals', label: 'Pending Approvals', icon: '⏳' },
    { path: '/doctor/approved-reports', label: 'Approved Reports', icon: '✅' },
  ]

  const staffMenuItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/staff/patients', label: 'Patients', icon: '👤' },
    { path: '/staff/sample-collection', label: 'Sample Collection', icon: '🧪' },
    { path: '/staff/test-entry', label: 'Test Entry', icon: '📝' },
    { path: '/staff/invoices', label: 'Invoices', icon: '💰' },
  ]

  const getMenuItems = () => {
    if (userRole === ROLES.ADMIN) return adminMenuItems
    if (userRole === ROLES.DOCTOR) return doctorMenuItems
    if (userRole === ROLES.TECHNICIAN || userRole === ROLES.STAFF)
      return staffMenuItems
    return []
  }

  const menuItems = getMenuItems()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar

