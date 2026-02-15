import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/roleConstants'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import toast from 'react-hot-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { userRole, loading: authLoading } = useAuth()

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
    </div>
  )
}

export default Login

