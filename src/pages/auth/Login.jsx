import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/roleConstants'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import toast from 'react-hot-toast'

// Development mode check
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

// Test accounts for development (update these with your actual test user emails)
const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: ROLES.ADMIN,
  },
  doctor: {
    email: 'doctor@test.com',
    password: 'doctor123',
    role: ROLES.DOCTOR,
  },
  staff: {
    email: 'staff@test.com',
    password: 'staff123',
    role: ROLES.STAFF,
  },
  technician: {
    email: 'technician@test.com',
    password: 'tech123',
    role: ROLES.TECHNICIAN,
  },
  patient: {
    email: 'patient@test.com',
    password: 'patient123',
    role: ROLES.PATIENT,
  },
}

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { userRole, loading: authLoading, setMockUser } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && userRole) {
      if (userRole === ROLES.ADMIN) {
        navigate('/admin/dashboard', { replace: true })
      } else if (userRole === ROLES.DOCTOR) {
        navigate('/doctor/dashboard', { replace: true })
      } else if (userRole === ROLES.TECHNICIAN || userRole === ROLES.STAFF) {
        navigate('/staff/dashboard', { replace: true })
      } else if (userRole === ROLES.PATIENT) {
        navigate('/patient/portal', { replace: true })
      }
    }
  }, [userRole, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)
      // Navigation will be handled by AuthContext and router
      toast.success('Login successful!')
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = 'Login failed. Please try again.'
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (accountType) => {
    if (!isDevelopment) {
      toast.error('Quick login is only available in development mode')
      return
    }

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
    setMockUser(testAccount.role, `${testAccount.role} User`)
    toast.success(`Logged in as ${testAccount.role} (Development Mode)`)

    // Navigate based on role
    setTimeout(() => {
      if (testAccount.role === ROLES.ADMIN) {
        navigate('/admin/dashboard', { replace: true })
      } else if (testAccount.role === ROLES.DOCTOR) {
        navigate('/doctor/dashboard', { replace: true })
      } else if (testAccount.role === ROLES.TECHNICIAN || testAccount.role === ROLES.STAFF) {
        navigate('/staff/dashboard', { replace: true })
      } else if (testAccount.role === ROLES.PATIENT) {
        navigate('/patient/portal', { replace: true })
      }
    }, 100)
  }

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={loading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader size="sm" className="mr-2" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      {/* Development Quick Login Section */}
      {isDevelopment && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-4">
            🛠️ Development Mode - Quick Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="text-xs"
            >
              👑 Admin
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickLogin('doctor')}
              disabled={loading}
              className="text-xs"
            >
              👨‍⚕️ Doctor
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickLogin('staff')}
              disabled={loading}
              className="text-xs"
            >
              👤 Staff
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickLogin('technician')}
              disabled={loading}
              className="text-xs"
            >
              🔧 Technician
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleQuickLogin('patient')}
              disabled={loading}
              className="text-xs col-span-2"
            >
              🏥 Patient
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            ⚡ Bypasses Firebase - No database check required
          </p>
        </div>
      )}
    </div>
  )
}

export default Login

