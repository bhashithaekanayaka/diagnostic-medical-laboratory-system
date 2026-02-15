import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { generateLogID } from '../utils/generateID'

const COLLECTION_NAME = 'activityLogs'

/**
 * Log an activity
 * @param {string} userId - User ID who performed the action
 * @param {string} entityType - Type of entity (patient, test, invoice, etc.)
 * @param {string} action - Action performed (create, update, delete, approve, reject)
 * @param {string} entityId - ID of the entity
 * @param {Object} details - Additional details about the action
 */
export const logActivity = async (userId, entityType, action, entityId, details = {}) => {
  try {
    const logId = generateLogID()

    const logEntry = {
      log_id: logId,
      user_id: userId,
      entity_type: entityType,
      action,
      entity_id: entityId,
      details,
      timestamp: serverTimestamp(),
    }

    await addDoc(collection(db, COLLECTION_NAME), logEntry)
    return logId
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw error - logging should not break the main flow
  }
}

/**
 * Get activity logs for a specific entity
 */
export const getActivityLogsByEntity = async (entityType, entityId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('entity_type', '==', entityType),
      where('entity_id', '==', entityId),
      orderBy('timestamp', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    throw error
  }
}

/**
 * Get activity logs for a specific user
 */
export const getActivityLogsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('user_id', '==', userId),
      orderBy('timestamp', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching user activity logs:', error)
    throw error
  }
}

/**
 * Get all activity logs (for admin)
 */
export const getAllActivityLogs = async (limit = 100) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('timestamp', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.slice(0, limit).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    throw error
  }
}

