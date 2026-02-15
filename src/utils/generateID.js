// Generate unique IDs for various entities

/**
 * Generate a unique Patient ID (format: PAT-YYYYMMDD-XXXX)
 * @returns {string} Patient ID
 */
export const generatePatientID = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `PAT-${year}${month}${day}-${random}`
}

/**
 * Generate a unique Sample ID (format: SMP-YYYYMMDD-XXXX)
 * @returns {string} Sample ID
 */
export const generateSampleID = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `SMP-${year}${month}${day}-${random}`
}

/**
 * Generate a unique Test Order ID (format: TST-YYYYMMDD-XXXX)
 * @returns {string} Test Order ID
 */
export const generateTestOrderID = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `TST-${year}${month}${day}-${random}`
}

/**
 * Generate a unique Invoice ID (format: INV-YYYYMMDD-XXXX)
 * @returns {string} Invoice ID
 */
export const generateInvoiceID = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `INV-${year}${month}${day}-${random}`
}

/**
 * Generate a unique Activity Log ID (format: LOG-YYYYMMDD-XXXX)
 * @returns {string} Log ID
 */
export const generateLogID = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `LOG-${year}${month}${day}-${random}`
}

/**
 * Generate a unique Report ID (format: RPT-YYYYMMDD-XXXX)
 * @returns {string} Report ID
 */
export const generateReportID = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(1000 + Math.random() * 9000)
  return `RPT-${year}${month}${day}-${random}`
}

