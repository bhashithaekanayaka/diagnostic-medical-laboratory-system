import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../config/firebase'
import { USER_STATUS } from '../utils/statusConstants'
import { ROLES } from '../utils/roleConstants'

const COLLECTION_NAME = 'users'

/**
 * Create a new user (Admin only)
 */
export const createUser = async (userData, createdBy) => {
  try {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      throw new Error('Invalid email format.')
    }

    // Validate role
    if (!Object.values(ROLES).includes(userData.role)) {
      throw new Error('Invalid role.')
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    )

    // Create user document in Firestore
    const newUser = {
      user_id: userCredential.user.uid,
      full_name: userData.full_name.trim(),
      email: userData.email.trim(),
      role: userData.role,
      status: USER_STATUS.ACTIVE,
      phone: userData.phone?.trim() || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy,
    }

    await addDoc(collection(db, COLLECTION_NAME), newUser)
    return { id: userCredential.user.uid, ...newUser }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Get user by ID
 */
export const getUser = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

/**
 * Get all users
 */
export const getAllUsers = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Update user
 */
export const updateUser = async (userId, userData, updatedBy) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error('User not found.')
    }

    const userDoc = querySnapshot.docs[0]
    const updateData = {
      ...userData,
      updatedAt: serverTimestamp(),
      updatedBy,
    }

    await updateDoc(doc(db, COLLECTION_NAME, userDoc.id), updateData)
    const updatedDoc = await getDoc(doc(db, COLLECTION_NAME, userDoc.id))
    return { id: updatedDoc.id, ...updatedDoc.data() }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Update user status (disable/enable)
 */
export const updateUserStatus = async (userId, status, updatedBy) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      throw new Error('User not found.')
    }

    const userDoc = querySnapshot.docs[0]
    await updateDoc(doc(db, COLLECTION_NAME, userDoc.id), {
      status,
      updatedAt: serverTimestamp(),
      updatedBy,
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    throw error
  }
}

/**
 * Soft delete user (set status to inactive)
 */
export const deleteUser = async (userId, deletedBy) => {
  try {
    await updateUserStatus(userId, USER_STATUS.INACTIVE, deletedBy)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

