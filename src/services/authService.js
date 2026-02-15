import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    return userCredential
  } catch (error) {
    throw error
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    throw error
  }
}

/**
 * Get user data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User data or null
 */
export const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    throw error
  }
}

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

