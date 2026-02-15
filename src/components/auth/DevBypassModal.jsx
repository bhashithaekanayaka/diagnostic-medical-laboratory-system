import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/roleConstants'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

// Development mode check
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

// Test accounts for development
const TEST_ACCOUNTS = {
  admin: {
    role: ROLES.ADMIN,
    label: 'Admin',
    icon: '👑',
  },
  doctor: {
    role: ROLES.DOCTOR,
    label: 'Doctor',
    icon: '👨‍⚕️',
  },
  staff: {
    role: ROLES.STAFF,
    label: 'Staff',
    icon: '👤',
  },
  technician: {
    role: ROLES.TECHNICIAN,
    label: 'Technician',
    icon: '🔧',
  },
  patient: {
    role: ROLES.PATIENT,
    label: 'Patient',
    icon: '🏥',
  },
}

const DevBypassModal = ({ isOpen, onClose }) => {
  const { setMockUser } = useAuth()
  const navigate = useNavigate()

  if (!isDevelopment) {
    return null
  }

  const handleQuickLogin = (accountType) => {
    if (!setMockUser) {
      toast.error('Mock user function not available')
      return
    }

    const testAccount = TEST_ACCOUNTS[accountType]
    if (!testAccount) {
      toast.error('Invalid test account type')
      return
    }

    // Bypass Firebase completely - set mock user directly
    setMockUser(testAccount.role, `${testAccount.label} User`)
    toast.success(`Logged in as ${testAccount.label} (Development Mode)`)
    onClose()

    // Navigate based on role
    setTimeout(() => {
      if (testAccount.role === ROLES.ADMIN) {
        navigate('/admin/dashboard', { replace: true })
      } else if (testAccount.role === ROLES.DOCTOR) {
        navigate('/doctor/dashboard', { replace: true })
      } else if (
        testAccount.role === ROLES.TECHNICIAN ||
        testAccount.role === ROLES.STAFF
      ) {
        navigate('/staff/dashboard', { replace: true })
      } else if (testAccount.role === ROLES.PATIENT) {
        navigate('/patient/portal', { replace: true })
      }
    }, 100)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Development Bypass" size="md">
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Development Mode Only</strong>
            <br />
            This bypass skips Firebase authentication and database checks.
            Perfect for UI/UX testing without backend setup.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(TEST_ACCOUNTS).map(([key, account]) => (
            <Button
              key={key}
              type="button"
              variant="outline"
              onClick={() => handleQuickLogin(key)}
              className="flex flex-col items-center gap-2 py-4 h-auto"
            >
              <span className="text-2xl">{account.icon}</span>
              <span className="text-sm font-medium">{account.label}</span>
            </Button>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          ⚡ Bypasses Firebase - No database check required
        </p>
      </div>
    </Modal>
  )
}

export default DevBypassModal

