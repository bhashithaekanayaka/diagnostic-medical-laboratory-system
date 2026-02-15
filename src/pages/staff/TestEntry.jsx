import { useState, useEffect } from 'react'
import { getAllTestOrders, getTestResultsByOrder, saveTestResult, updateTestResultStatus } from '../../services/testService'
import { getAllPatients } from '../../services/patientService'
import { useAuth } from '../../hooks/useAuth'
import { logActivity } from '../../services/activityLogService'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import TestResultForm from '../../components/forms/TestResultForm'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { TEST_RESULT_STATUS } from '../../utils/statusConstants'

const TestEntry = () => {
  const [testOrders, setTestOrders] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { userData } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersData, patientsData] = await Promise.all([
        getAllTestOrders(),
        getAllPatients(),
      ])
      setTestOrders(ordersData)
      setPatients(patientsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleEnterResult = async (orderId) => {
    setSelectedOrder(orderId)
    setIsModalOpen(true)
  }

  const handleSubmitForApproval = async (orderId) => {
    try {
      const results = await getTestResultsByOrder(orderId)
      for (const result of results) {
        if (result.status === TEST_RESULT_STATUS.DRAFT) {
          await updateTestResultStatus(
            result.id,
            TEST_RESULT_STATUS.PENDING_APPROVAL,
            userData.user_id
          )
        }
      }
      await logActivity(userData.user_id, 'test_result', 'submit', orderId)
      toast.success('Results submitted for approval')
      fetchData()
    } catch (error) {
      console.error('Error submitting results:', error)
      toast.error('Failed to submit results')
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Entry</h1>

      <Table
        headers={['Order ID', 'Patient', 'Status', 'Actions']}
        className="bg-white rounded-lg shadow"
      >
        {testOrders.map((order) => (
          <tr key={order.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {order.test_order_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {getPatientName(order.patient_id)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge variant="warning">{order.status}</Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleEnterResult(order.id)}
              >
                Enter Results
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleSubmitForApproval(order.id)}
              >
                Submit for Approval
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enter Test Results"
        size="lg"
      >
        <TestResultForm
          testOrderId={selectedOrder}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchData()
          }}
        />
      </Modal>
    </div>
  )
}

export default TestEntry

