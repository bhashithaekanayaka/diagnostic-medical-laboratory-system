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
import { generateInvoiceID } from '../utils/generateID'
import { INVOICE_STATUS } from '../utils/statusConstants'

const COLLECTION_NAME = 'invoices'

/**
 * Create a new invoice
 */
export const createInvoice = async (invoiceData, userId) => {
  try {
    const invoiceId = generateInvoiceID()

    // Calculate total
    const subtotal = invoiceData.items.reduce(
      (sum, item) => sum + parseFloat(item.price) * parseFloat(item.quantity),
      0
    )
    const tax = parseFloat(invoiceData.tax || 0)
    const discount = parseFloat(invoiceData.discount || 0)
    const total = subtotal + tax - discount

    const newInvoice = {
      invoice_id: invoiceId,
      patient_id: invoiceData.patient_id,
      test_order_id: invoiceData.test_order_id || null,
      items: invoiceData.items,
      subtotal,
      tax,
      discount,
      total,
      status: INVOICE_STATUS.PENDING,
      due_date: invoiceData.due_date || null,
      notes: invoiceData.notes || '',
      created_by: userId,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newInvoice)
    return { id: docRef.id, ...newInvoice }
  } catch (error) {
    console.error('Error creating invoice:', error)
    throw error
  }
}

/**
 * Get invoice by ID
 */
export const getInvoice = async (invoiceId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, invoiceId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists() && !docSnap.data().isDeleted) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching invoice:', error)
    throw error
  }
}

/**
 * Get all invoices
 */
export const getAllInvoices = async () => {
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
    console.error('Error fetching invoices:', error)
    throw error
  }
}

/**
 * Get invoices by patient ID
 */
export const getInvoicesByPatient = async (patientId) => {
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
    console.error('Error fetching patient invoices:', error)
    throw error
  }
}

/**
 * Update invoice
 */
export const updateInvoice = async (invoiceId, invoiceData, userId) => {
  try {
    const invoiceRef = doc(db, COLLECTION_NAME, invoiceId)
    const invoiceDoc = await getDoc(invoiceRef)

    if (!invoiceDoc.exists() || invoiceDoc.data().isDeleted) {
      throw new Error('Invoice not found.')
    }

    // Recalculate total if items changed
    let updateData = { ...invoiceData, updatedAt: serverTimestamp() }

    if (invoiceData.items) {
      const subtotal = invoiceData.items.reduce(
        (sum, item) =>
          sum + parseFloat(item.price) * parseFloat(item.quantity),
        0
      )
      const tax = parseFloat(invoiceData.tax || invoiceDoc.data().tax || 0)
      const discount = parseFloat(
        invoiceData.discount || invoiceDoc.data().discount || 0
      )
      const total = subtotal + tax - discount

      updateData.subtotal = subtotal
      updateData.total = total
    }

    updateData.updatedBy = userId

    await updateDoc(invoiceRef, updateData)
    const updatedDoc = await getDoc(invoiceRef)
    return { id: updatedDoc.id, ...updatedDoc.data() }
  } catch (error) {
    console.error('Error updating invoice:', error)
    throw error
  }
}

/**
 * Update invoice status
 */
export const updateInvoiceStatus = async (invoiceId, status, userId) => {
  try {
    const invoiceRef = doc(db, COLLECTION_NAME, invoiceId)
    await updateDoc(invoiceRef, {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error('Error updating invoice status:', error)
    throw error
  }
}

/**
 * Soft delete invoice
 */
export const deleteInvoice = async (invoiceId, userId) => {
  try {
    const invoiceRef = doc(db, COLLECTION_NAME, invoiceId)
    await updateDoc(invoiceRef, {
      isDeleted: true,
      status: INVOICE_STATUS.CANCELLED,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    throw error
  }
}

