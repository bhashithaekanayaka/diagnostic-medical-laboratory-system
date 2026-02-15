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
import { generateSampleID, generateTestOrderID } from '../utils/generateID'
import {
  SAMPLE_STATUS,
  TEST_ORDER_STATUS,
  TEST_RESULT_STATUS,
} from '../utils/statusConstants'

const SAMPLES_COLLECTION = 'samples'
const TEST_ORDERS_COLLECTION = 'testOrders'
const TEST_RESULTS_COLLECTION = 'testResults'

/**
 * Create a new sample
 */
export const createSample = async (sampleData, userId) => {
  try {
    const sampleId = generateSampleID()

    const newSample = {
      sample_id: sampleId,
      patient_id: sampleData.patient_id,
      sample_type: sampleData.sample_type,
      collection_date: sampleData.collection_date,
      collected_by: userId,
      status: SAMPLE_STATUS.PENDING,
      notes: sampleData.notes || '',
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, SAMPLES_COLLECTION), newSample)
    return { id: docRef.id, ...newSample }
  } catch (error) {
    console.error('Error creating sample:', error)
    throw error
  }
}

/**
 * Get sample by ID
 */
export const getSample = async (sampleId) => {
  try {
    const docRef = doc(db, SAMPLES_COLLECTION, sampleId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists() && !docSnap.data().isDeleted) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching sample:', error)
    throw error
  }
}

/**
 * Get all samples
 */
export const getAllSamples = async () => {
  try {
    const q = query(
      collection(db, SAMPLES_COLLECTION),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching samples:', error)
    throw error
  }
}

/**
 * Update sample status
 */
export const updateSampleStatus = async (sampleId, status, userId) => {
  try {
    const sampleRef = doc(db, SAMPLES_COLLECTION, sampleId)
    await updateDoc(sampleRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error('Error updating sample status:', error)
    throw error
  }
}

/**
 * Create a new test order
 */
export const createTestOrder = async (testOrderData, userId) => {
  try {
    const testOrderId = generateTestOrderID()

    const newTestOrder = {
      test_order_id: testOrderId,
      patient_id: testOrderData.patient_id,
      sample_id: testOrderData.sample_id,
      tests: testOrderData.tests, // Array of test IDs
      ordered_by: userId,
      status: TEST_ORDER_STATUS.PENDING,
      notes: testOrderData.notes || '',
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(
      collection(db, TEST_ORDERS_COLLECTION),
      newTestOrder
    )
    return { id: docRef.id, ...newTestOrder }
  } catch (error) {
    console.error('Error creating test order:', error)
    throw error
  }
}

/**
 * Get test order by ID
 */
export const getTestOrder = async (testOrderId) => {
  try {
    const docRef = doc(db, TEST_ORDERS_COLLECTION, testOrderId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists() && !docSnap.data().isDeleted) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching test order:', error)
    throw error
  }
}

/**
 * Get all test orders
 */
export const getAllTestOrders = async () => {
  try {
    const q = query(
      collection(db, TEST_ORDERS_COLLECTION),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching test orders:', error)
    throw error
  }
}

/**
 * Update test order status
 */
export const updateTestOrderStatus = async (testOrderId, status, userId) => {
  try {
    const testOrderRef = doc(db, TEST_ORDERS_COLLECTION, testOrderId)
    await updateDoc(testOrderRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error('Error updating test order status:', error)
    throw error
  }
}

/**
 * Create or update test result
 */
export const saveTestResult = async (resultData, userId) => {
  try {
    const { test_order_id, test_id, result_value, reference_range, status } =
      resultData

    // Check if result already exists
    const existingResultQuery = query(
      collection(db, TEST_RESULTS_COLLECTION),
      where('test_order_id', '==', test_order_id),
      where('test_id', '==', test_id),
      where('isDeleted', '==', false)
    )
    const existingResults = await getDocs(existingResultQuery)

    const resultDataToSave = {
      test_order_id,
      test_id,
      result_value: parseFloat(result_value),
      reference_range,
      status: status || TEST_RESULT_STATUS.DRAFT,
      entered_by: userId,
      isDeleted: false,
      updatedAt: serverTimestamp(),
    }

    if (!existingResults.empty) {
      // Update existing result
      const existingDoc = existingResults.docs[0]
      await updateDoc(doc(db, TEST_RESULTS_COLLECTION, existingDoc.id), {
        ...resultDataToSave,
        updatedAt: serverTimestamp(),
      })
      return { id: existingDoc.id, ...resultDataToSave }
    } else {
      // Create new result
      resultDataToSave.createdAt = serverTimestamp()
      const docRef = await addDoc(
        collection(db, TEST_RESULTS_COLLECTION),
        resultDataToSave
      )
      return { id: docRef.id, ...resultDataToSave }
    }
  } catch (error) {
    console.error('Error saving test result:', error)
    throw error
  }
}

/**
 * Get test results for a test order
 */
export const getTestResultsByOrder = async (testOrderId) => {
  try {
    const q = query(
      collection(db, TEST_RESULTS_COLLECTION),
      where('test_order_id', '==', testOrderId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching test results:', error)
    throw error
  }
}

/**
 * Update test result status (for approval workflow)
 */
export const updateTestResultStatus = async (
  resultId,
  status,
  userId,
  rejectionReason = null
) => {
  try {
    const resultRef = doc(db, TEST_RESULTS_COLLECTION, resultId)
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }

    if (status === TEST_RESULT_STATUS.REJECTED && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    if (status === TEST_RESULT_STATUS.APPROVED) {
      updateData.approved_by = userId
      updateData.approved_at = serverTimestamp()
    }

    await updateDoc(resultRef, updateData)
  } catch (error) {
    console.error('Error updating test result status:', error)
    throw error
  }
}

/**
 * Get pending results for approval
 */
export const getPendingResults = async () => {
  try {
    const q = query(
      collection(db, TEST_RESULTS_COLLECTION),
      where('status', '==', TEST_RESULT_STATUS.PENDING_APPROVAL),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching pending results:', error)
    throw error
  }
}

