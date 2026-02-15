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
import { db } from '../config/firebase'
import { generatePatientID } from '../utils/generateID'
import { PATIENT_STATUS } from '../utils/statusConstants'

const COLLECTION_NAME = 'patients'

/**
 * Create a new patient
 * Implements FR-1 to FR-8 validation rules
 */
export const createPatient = async (patientData, userId) => {
  try {
    // FR-1: Validate NIC format (Sri Lankan NIC: 9 digits or 12 digits with V/X)
    const nicRegex = /^(\d{9}[vVxX]|\d{12})$/
    if (!nicRegex.test(patientData.nic)) {
      throw new Error('Invalid NIC format. Must be 9 digits with V/X or 12 digits.')
    }

    // FR-2: Check for duplicate NIC
    const existingPatient = await getPatientByNIC(patientData.nic)
    if (existingPatient && !existingPatient.isDeleted) {
      throw new Error('A patient with this NIC already exists.')
    }

    // FR-3: Auto-generate Patient ID
    const patientId = generatePatientID()

    // FR-4: Validate required fields
    const requiredFields = ['full_name', 'nic', 'date_of_birth', 'gender', 'phone']
    for (const field of requiredFields) {
      if (!patientData[field]) {
        throw new Error(`${field.replace('_', ' ')} is required.`)
      }
    }

    // FR-5: Validate phone number format
    const phoneRegex = /^0\d{9}$/
    if (!phoneRegex.test(patientData.phone)) {
      throw new Error('Invalid phone number format. Must be 10 digits starting with 0.')
    }

    // FR-6: Validate email format if provided
    if (patientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      throw new Error('Invalid email format.')
    }

    // FR-7: Validate date of birth (must be in the past)
    const dob = new Date(patientData.date_of_birth)
    if (dob >= new Date()) {
      throw new Error('Date of birth must be in the past.')
    }

    // FR-8: Set default status to Active
    const newPatient = {
      patient_id: patientId,
      full_name: patientData.full_name.trim(),
      nic: patientData.nic.toUpperCase(),
      date_of_birth: patientData.date_of_birth,
      gender: patientData.gender,
      phone: patientData.phone,
      email: patientData.email?.trim() || '',
      address: patientData.address?.trim() || '',
      status: PATIENT_STATUS.ACTIVE,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newPatient)
    return { id: docRef.id, ...newPatient }
  } catch (error) {
    console.error('Error creating patient:', error)
    throw error
  }
}

/**
 * Get patient by ID
 */
export const getPatient = async (patientId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, patientId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists() && !docSnap.data().isDeleted) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching patient:', error)
    throw error
  }
}

/**
 * Get patient by NIC
 */
export const getPatientByNIC = async (nic) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('nic', '==', nic.toUpperCase()),
      where('isDeleted', '==', false)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching patient by NIC:', error)
    throw error
  }
}

/**
 * Get all patients (with soft delete filter)
 */
export const getAllPatients = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching patients:', error)
    throw error
  }
}

/**
 * Update patient
 */
export const updatePatient = async (patientId, patientData, userId) => {
  try {
    const patientRef = doc(db, COLLECTION_NAME, patientId)
    const patientDoc = await getDoc(patientRef)

    if (!patientDoc.exists() || patientDoc.data().isDeleted) {
      throw new Error('Patient not found.')
    }

    // Validate NIC if changed
    if (patientData.nic && patientData.nic !== patientDoc.data().nic) {
      const existingPatient = await getPatientByNIC(patientData.nic)
      if (existingPatient && existingPatient.id !== patientId) {
        throw new Error('A patient with this NIC already exists.')
      }
    }

    const updateData = {
      ...patientData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }

    await updateDoc(patientRef, updateData)
    const updatedDoc = await getDoc(patientRef)
    return { id: updatedDoc.id, ...updatedDoc.data() }
  } catch (error) {
    console.error('Error updating patient:', error)
    throw error
  }
}

/**
 * Soft delete patient (set isDeleted flag)
 */
export const deletePatient = async (patientId, userId) => {
  try {
    const patientRef = doc(db, COLLECTION_NAME, patientId)
    await updateDoc(patientRef, {
      isDeleted: true,
      status: PATIENT_STATUS.INACTIVE,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error('Error deleting patient:', error)
    throw error
  }
}

/**
 * Update patient status
 */
export const updatePatientStatus = async (patientId, status, userId) => {
  try {
    const patientRef = doc(db, COLLECTION_NAME, patientId)
    await updateDoc(patientRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error('Error updating patient status:', error)
    throw error
  }
}

