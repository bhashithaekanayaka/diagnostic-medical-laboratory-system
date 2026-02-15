import { useState, useEffect } from 'react'
import { getAllInvoices, createInvoice } from '../../services/invoiceService'
import { getAllPatients } from '../../services/patientService'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import InvoiceForm from '../../components/forms/InvoiceForm'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/formatDate'
import { INVOICE_STATUS } from '../../utils/statusConstants'

const StaffInvoices = () => {
  const [invoices, setInvoices] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [invoicesData, patientsData] = await Promise.all([
        getAllInvoices(),
        getAllPatients(),
      ])
      setInvoices(invoicesData)
      setPatients(patientsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInvoice = () => {
    setIsModalOpen(true)
  }

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId)
    return patient ? patient.full_name : 'Unknown'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
        <Button onClick={handleCreateInvoice}>Create Invoice</Button>
      </div>

      <Table
        headers={['Invoice ID', 'Patient', 'Total', 'Status', 'Date']}
        className="bg-white rounded-lg shadow"
      >
        {invoices.map((invoice) => (
          <tr key={invoice.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {invoice.invoice_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {getPatientName(invoice.patient_id)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
              {formatCurrency(invoice.total)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge
                variant={
                  invoice.status === INVOICE_STATUS.PAID
                    ? 'success'
                    : invoice.status === INVOICE_STATUS.PENDING
                    ? 'warning'
                    : 'danger'
                }
              >
                {invoice.status}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {invoice.createdAt
                ? new Date(invoice.createdAt.toDate()).toLocaleDateString()
                : 'N/A'}
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Invoice"
        size="lg"
      >
        <InvoiceForm
          patients={patients}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchData()
          }}
        />
      </Modal>
    </div>
  )
}

export default StaffInvoices

