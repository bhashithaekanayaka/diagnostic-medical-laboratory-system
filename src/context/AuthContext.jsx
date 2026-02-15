import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChange, getUserData } from '../services/authService'
import { ROLES } from '../utils/roleConstants'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

