import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/roleConstants'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import DevBypassModal from '../../components/auth/DevBypassModal'
import toast from 'react-hot-toast'

// Development mode check
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isBypassModalOpen, setIsBypassModalOpen] = useState(false)
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
    <div className="flex flex-col items-center justify-center relative overflow-hidden bg-background-light">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Development Bypass Button - Top Right */}
      {isDevelopment && (
        <button
          onClick={() => setIsBypassModalOpen(true)}
          className="fixed top-4 right-4 z-50 bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-lg shadow-lg transition-all flex items-center gap-2 text-sm font-medium"
          title="Development Bypass"
        >
          <span>🛠️</span>
          <span className="hidden sm:inline">Dev Bypass</span>
        </button>
      )}

      <main className="relative z-10 w-full max-w-md px-4  ">
        {/* Logo & Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-xl shadow-sm border border-primary/10">
            <svg
              className="w-12 h-12 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-10.038 0l-2.387.477a2 2 0 00-1.022.547M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-medical-navy tracking-tight">
            Diagnostic LMS
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Secure Laboratory Management Access
          </p>
        </div>

        {/* Authentication Card */}
        <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                className="block text-sm font-semibold text-gray-700"
                htmlFor="email"
              >
                Institutional Email
              </label>
              <div className="relative group">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-xl">
                  alternate_email
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 outline-none"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="j.doe@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="block text-sm font-semibold text-gray-700"
                  htmlFor="password"
                >
                  Security Password
                </label>
              </div>
              <div className="relative group">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-xl">
                  lock_outline
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-gray-900 outline-none"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <span className="material-icons text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center cursor-pointer group">
                <input
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary transition-all"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-gray-800">
                  Remember this device
                </span>
              </label>
              <a
                className="text-sm font-semibold text-primary hover:underline transition-all"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  toast.info('Password reset feature coming soon')
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-medical-navy hover:bg-primary text-white font-bold py-3.5 rounded-lg shadow-lg shadow-medical-navy/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader size="sm" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <span>Secure Sign In</span>
                  <span className="material-icons text-lg">verified_user</span>
                </>
              )}
            </button>
          </form>

         
        </div>

        {/* System Status/Footer */}
        <footer className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-6">
            <a
              className="text-sm text-gray-500 hover:text-primary transition-colors"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                toast.info('System support coming soon')
              }}
            >
              System Support
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <a
              className="text-sm text-gray-500 hover:text-primary transition-colors"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                toast.info('Privacy policy coming soon')
              }}
            >
              Privacy Policy
            </a>
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <a
              className="text-sm text-gray-500 hover:text-primary transition-colors"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                toast.info('Compliance information coming soon')
              }}
            >
              Compliance
            </a>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 Diagnostic Management Systems. All laboratory data is subject to
            HIPAA regulations.
          </p>
        </footer>
      </main>

      {/* Side Decoration (Hidden on mobile) */}
      <div className="fixed bottom-8 right-8 hidden lg:flex items-center gap-4 bg-white/80 backdrop-blur-md p-3 rounded-full border border-primary/10 shadow-lg">
        <div className="flex -space-x-2">
          <div className="w-8 h-8 rounded-full border-2 border-white bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">
            LIVE
          </div>
        </div>
        <div className="text-xs font-medium text-gray-600">
          System Operational:{' '}
          <span className="text-green-500 font-bold">99.9% Uptime</span>
        </div>
      </div>

      {/* Development Bypass Modal */}
      <DevBypassModal
        isOpen={isBypassModalOpen}
        onClose={() => setIsBypassModalOpen(false)}
      />
    </div>
  )
}

export default Login
