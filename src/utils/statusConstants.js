// Patient status constants
export const PATIENT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  DISABLED: 'Disabled',
}

// Sample status constants
export const SAMPLE_STATUS = {
  PENDING: 'Pending',
  COLLECTED: 'Collected',
  REJECTED: 'Rejected',
  PROCESSED: 'Processed',
}

// Test order status constants
export const TEST_ORDER_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// Test result status constants
export const TEST_RESULT_STATUS = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RETURNED: 'Returned',
}

// Invoice status constants
export const INVOICE_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  PARTIAL: 'Partial',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
}

// User status constants
export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
}

// Inventory item status constants
export const INVENTORY_STATUS = {
  AVAILABLE: 'Available',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  EXPIRED: 'Expired',
}

// Get all statuses for a type
export const getStatuses = (type) => {
  const statusMap = {
    patient: PATIENT_STATUS,
    sample: SAMPLE_STATUS,
    testOrder: TEST_ORDER_STATUS,
    testResult: TEST_RESULT_STATUS,
    invoice: INVOICE_STATUS,
    user: USER_STATUS,
    inventory: INVENTORY_STATUS,
  }
  return statusMap[type] || {}
}

// Check if status is valid for a type
export const isValidStatus = (type, status) => {
  const statuses = getStatuses(type)
  return Object.values(statuses).includes(status)
}

