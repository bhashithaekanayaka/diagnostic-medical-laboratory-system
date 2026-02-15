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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { generateReportID } from '../utils/generateID'

const COLLECTION_NAME = 'reports'

/**
 * Generate PDF report (placeholder - implement with jsPDF or similar)
 * This is a simplified version - you'll need to implement actual PDF generation
 */
const generatePDF = async (reportData) => {
  // TODO: Implement actual PDF generation using jsPDF or similar library
  // For now, return a placeholder
  return new Blob(['PDF content placeholder'], { type: 'application/pdf' })
}

/**
 * Create a new report
 */
export const createReport = async (reportData, userId) => {
  try {
    const reportId = generateReportID()

    // Generate PDF
    const pdfBlob = await generatePDF(reportData)

    // Upload PDF to Firebase Storage
    const storageRef = ref(
      storage,
      `reports/${reportId}/${reportId}.pdf`
    )
    await uploadBytes(storageRef, pdfBlob)
    const downloadURL = await getDownloadURL(storageRef)

    // Save report metadata to Firestore
    const newReport = {
      report_id: reportId,
      patient_id: reportData.patient_id,
      test_order_id: reportData.test_order_id || null,
      report_type: reportData.report_type || 'Test Report',
      file_url: downloadURL,
      file_path: `reports/${reportId}/${reportId}.pdf`,
      generated_by: userId,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newReport)
    return { id: docRef.id, ...newReport }
  } catch (error) {
    console.error('Error creating report:', error)
    throw error
  }
}

/**
 * Get report by ID
 */
export const getReport = async (reportId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, reportId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists() && !docSnap.data().isDeleted) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching report:', error)
    throw error
  }
}

/**
 * Get all reports
 */
export const getAllReports = async () => {
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
    console.error('Error fetching reports:', error)
    throw error
  }
}

/**
 * Get reports by patient ID
 */
export const getReportsByPatient = async (patientId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('patient_id', '==', patientId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching patient reports:', error)
    throw error
  }
}

/**
 * Soft delete report
 */
export const deleteReport = async (reportId, userId) => {
  try {
    const reportRef = doc(db, COLLECTION_NAME, reportId)
    await updateDoc(reportRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error('Error deleting report:', error)
    throw error
  }
}

