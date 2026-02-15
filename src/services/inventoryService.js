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
import { INVENTORY_STATUS } from '../utils/statusConstants'

const COLLECTION_NAME = 'inventory'

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (itemData, userId) => {
  try {
    const newItem = {
      item_name: itemData.item_name.trim(),
      category: itemData.category,
      quantity: parseFloat(itemData.quantity) || 0,
      unit: itemData.unit,
      reorder_level: parseFloat(itemData.reorder_level) || 0,
      expiry_date: itemData.expiry_date || null,
      supplier: itemData.supplier?.trim() || '',
      cost_per_unit: parseFloat(itemData.cost_per_unit) || 0,
      status: INVENTORY_STATUS.AVAILABLE,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
    }

    // Check status based on quantity
    if (newItem.quantity <= 0) {
      newItem.status = INVENTORY_STATUS.OUT_OF_STOCK
    } else if (newItem.quantity <= newItem.reorder_level) {
      newItem.status = INVENTORY_STATUS.LOW_STOCK
    }

    // Check expiry date
    if (newItem.expiry_date) {
      const expiryDate = new Date(newItem.expiry_date)
      if (expiryDate < new Date()) {
        newItem.status = INVENTORY_STATUS.EXPIRED
      }
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newItem)
    return { id: docRef.id, ...newItem }
  } catch (error) {
    console.error('Error creating inventory item:', error)
    throw error
  }
}

/**
 * Get inventory item by ID
 */
export const getInventoryItem = async (itemId) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, itemId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists() && !docSnap.data().isDeleted) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    throw error
  }
}

/**
 * Get all inventory items
 */
export const getAllInventoryItems = async () => {
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
    console.error('Error fetching inventory items:', error)
    throw error
  }
}

/**
 * Get low stock items
 */
export const getLowStockItems = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', 'in', [
        INVENTORY_STATUS.LOW_STOCK,
        INVENTORY_STATUS.OUT_OF_STOCK,
      ]),
      where('isDeleted', '==', false),
      orderBy('quantity', 'asc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching low stock items:', error)
    throw error
  }
}

/**
 * Get expired items
 */
export const getExpiredItems = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('status', '==', INVENTORY_STATUS.EXPIRED),
      where('isDeleted', '==', false),
      orderBy('expiry_date', 'asc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Error fetching expired items:', error)
    throw error
  }
}

/**
 * Update inventory item
 */
export const updateInventoryItem = async (itemId, itemData, userId) => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId)
    const itemDoc = await getDoc(itemRef)

    if (!itemDoc.exists() || itemDoc.data().isDeleted) {
      throw new Error('Inventory item not found.')
    }

    const updateData = {
      ...itemData,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }

    // Recalculate status based on quantity
    const quantity = parseFloat(itemData.quantity ?? itemDoc.data().quantity)
    const reorderLevel =
      parseFloat(itemData.reorder_level ?? itemDoc.data().reorder_level) || 0

    if (quantity <= 0) {
      updateData.status = INVENTORY_STATUS.OUT_OF_STOCK
    } else if (quantity <= reorderLevel) {
      updateData.status = INVENTORY_STATUS.LOW_STOCK
    } else {
      updateData.status = INVENTORY_STATUS.AVAILABLE
    }

    // Check expiry date
    const expiryDate = itemData.expiry_date ?? itemDoc.data().expiry_date
    if (expiryDate) {
      const expiry = new Date(expiryDate)
      if (expiry < new Date()) {
        updateData.status = INVENTORY_STATUS.EXPIRED
      }
    }

    await updateDoc(itemRef, updateData)
    const updatedDoc = await getDoc(itemRef)
    return { id: updatedDoc.id, ...updatedDoc.data() }
  } catch (error) {
    console.error('Error updating inventory item:', error)
    throw error
  }
}

/**
 * Update inventory quantity
 */
export const updateInventoryQuantity = async (
  itemId,
  quantityChange,
  userId
) => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId)
    const itemDoc = await getDoc(itemRef)

    if (!itemDoc.exists() || itemDoc.data().isDeleted) {
      throw new Error('Inventory item not found.')
    }

    const currentQuantity = itemDoc.data().quantity || 0
    const newQuantity = currentQuantity + quantityChange

    if (newQuantity < 0) {
      throw new Error('Insufficient quantity in inventory.')
    }

    const reorderLevel = itemDoc.data().reorder_level || 0
    let status = INVENTORY_STATUS.AVAILABLE

    if (newQuantity <= 0) {
      status = INVENTORY_STATUS.OUT_OF_STOCK
    } else if (newQuantity <= reorderLevel) {
      status = INVENTORY_STATUS.LOW_STOCK
    }

    await updateDoc(itemRef, {
      quantity: newQuantity,
      status,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })

    return { id: itemDoc.id, quantity: newQuantity, status }
  } catch (error) {
    console.error('Error updating inventory quantity:', error)
    throw error
  }
}

/**
 * Soft delete inventory item
 */
export const deleteInventoryItem = async (itemId, userId) => {
  try {
    const itemRef = doc(db, COLLECTION_NAME, itemId)
    await updateDoc(itemRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    throw error
  }
}

