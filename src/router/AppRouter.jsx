import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import { ROLES } from '../utils/roleConstants'

// Layouts
import AuthLayout from '../layouts/AuthLayout'
import AdminLayout from '../layouts/AdminLayout'
import StaffLayout from '../layouts/StaffLayout'
import DoctorLayout from '../layouts/DoctorLayout'

// Auth Pages
import Login from '../pages/auth/Login'

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard'
import AdminUsers from '../pages/admin/Users'
import AdminInventory from '../pages/admin/Inventory'
import AdminReports from '../pages/admin/Reports'

// Staff Pages
import StaffDashboard from '../pages/staff/Dashboard'
import StaffPatients from '../pages/staff/Patients'
import SampleCollection from '../pages/staff/SampleCollection'
import TestEntry from '../pages/staff/TestEntry'
import StaffInvoices from '../pages/staff/Invoices'

// Doctor Pages
import DoctorDashboard from '../pages/doctor/Dashboard'
import PendingApprovals from '../pages/doctor/PendingApprovals'
import ApprovedReports from '../pages/doctor/ApprovedReports'

// Patient Pages
import PatientPortal from '../pages/patient/Portal'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

        {/* Staff/Technician Routes */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute
                allowedRoles={[ROLES.TECHNICIAN, ROLES.STAFF]}
              >
                <StaffLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/patients" element={<StaffPatients />} />
          <Route
            path="/staff/sample-collection"
            element={<SampleCollection />}
          />
          <Route path="/staff/test-entry" element={<TestEntry />} />
          <Route path="/staff/invoices" element={<StaffInvoices />} />
        </Route>

        {/* Doctor Routes */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.DOCTOR]}>
                <DoctorLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route
            path="/doctor/pending-approvals"
            element={<PendingApprovals />}
          />
          <Route
            path="/doctor/approved-reports"
            element={<ApprovedReports />}
          />
        </Route>

        {/* Patient Routes */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.PATIENT]}>
                <PatientPortal />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/patient/portal" element={<PatientPortal />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

