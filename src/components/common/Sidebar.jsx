import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/roleConstants'

const Sidebar = () => {
  const { userRole } = useAuth()

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/users', label: 'Patients', icon: 'people' },
    { path: '/admin/tests', label: 'Lab Tests', icon: 'science' },
    { path: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
    { path: '/staff/invoices', label: 'Billing', icon: 'payments' },
  ]

  const adminSubMenuItems = [
    { path: '/admin/users', label: 'Staff Management', icon: 'manage_accounts' },
    { path: '/admin/reports', label: 'Reports', icon: 'analytics' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' },
  ]

  const doctorMenuItems = [
    { path: '/doctor/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/doctor/pending-approvals', label: 'Pending Approvals', icon: 'hourglass_empty' },
    { path: '/doctor/approved-reports', label: 'Approved Reports', icon: 'verified' },
  ]

  const staffMenuItems = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/staff/patients', label: 'Patients', icon: 'people' },
    { path: '/staff/sample-collection', label: 'Sample Collection', icon: 'science' },
    { path: '/staff/test-entry', label: 'Test Entry', icon: 'edit' },
    { path: '/staff/invoices', label: 'Invoices', icon: 'receipt' },
  ]

  const getMenuItems = () => {
    if (userRole === ROLES.ADMIN) return { main: adminMenuItems, sub: adminSubMenuItems }
    if (userRole === ROLES.DOCTOR) return { main: doctorMenuItems, sub: [] }
    if (userRole === ROLES.TECHNICIAN || userRole === ROLES.STAFF)
      return { main: staffMenuItems, sub: [] }
    return { main: [], sub: [] }
  }

  const { main, sub } = getMenuItems()

  return (
    <aside className="w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-50 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="material-icons text-white">biotech</span>
        </div>
        <span className="font-bold text-xl tracking-tight">
          LabOS <span className="text-primary text-sm align-top">PRO</span>
        </span>
      </div>
      <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {main.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Main Menu
            </div>
            {main.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'sidebar-item-active'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <span className="material-icons text-[20px]">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
        {sub.length > 0 && (
          <>
            <div className="px-3 py-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Administration
            </div>
            {sub.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'sidebar-item-active'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <span className="material-icons text-[20px]">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="bg-primary/5 rounded-xl p-4">
          <p className="text-xs font-semibold text-primary uppercase">Storage Usage</p>
          <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[72%]"></div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">7.2GB of 10GB used</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
