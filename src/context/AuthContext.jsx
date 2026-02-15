import { useEffect, useState } from 'react'
import { onAuthStateChange, getUserData } from '../services/authService'
import { ROLES } from '../utils/roleConstants'
import { AuthContext } from './authContext'

// Development mode check
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMockMode, setIsMockMode] = useState(false)

  useEffect(() => {
    // Skip Firebase auth if in mock mode (development bypass)
    // Loading state is handled by setMockUser when entering mock mode
    if (isMockMode) {
      return
    }

    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDataFromDb = await getUserData(firebaseUser.uid)

          if (userDataFromDb) {
            // Check if user is active
            if (userDataFromDb.status === 'Active') {
              setCurrentUser(firebaseUser)
              setUserRole(userDataFromDb.role)
              setUserData(userDataFromDb)
            } else {
              // User is inactive, suspended, or disabled
              setCurrentUser(null)
              setUserRole(null)
              setUserData(null)
            }
          } else {
            // User data not found in Firestore
            setCurrentUser(null)
            setUserRole(null)
            setUserData(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setCurrentUser(null)
          setUserRole(null)
          setUserData(null)
        }
      } else {
        // No user signed in
        setCurrentUser(null)
        setUserRole(null)
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isMockMode])

  // Development bypass function - sets mock user without Firebase
  const setMockUser = (role, fullName = 'Test User') => {
    if (!isDevelopment) {
      console.warn('Mock user can only be set in development mode')
      return
    }

    const mockUser = {
      uid: `mock-${role.toLowerCase()}-${Date.now()}`,
      email: `${role.toLowerCase()}@test.com`,
      displayName: fullName,
    }

    const mockUserData = {
      id: mockUser.uid,
      user_id: mockUser.uid,
      full_name: fullName,
      email: mockUser.email,
      role: role,
      status: 'Active',
      phone: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setIsMockMode(true)
    setCurrentUser(mockUser)
    setUserRole(role)
    setUserData(mockUserData)
    setLoading(false)
  }

  const value = {
    currentUser,
    userRole,
    userData,
    loading,
    isAuthenticated: !!currentUser,
    isAdmin: userRole === ROLES.ADMIN,
    isDoctor: userRole === ROLES.DOCTOR,
    isTechnician: userRole === ROLES.TECHNICIAN,
    isStaff: userRole === ROLES.STAFF || userRole === ROLES.TECHNICIAN,
    isPatient: userRole === ROLES.PATIENT,
    setMockUser: isDevelopment ? setMockUser : undefined, // Only expose in development
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

