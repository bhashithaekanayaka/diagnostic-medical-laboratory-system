import { useState, useEffect } from 'react'
import { getPendingResults, updateTestResultStatus, getTestResultsByOrder } from '../../services/testService'
import { getTestOrder, getAllTestOrders } from '../../services/testService'
import { getAllPatients } from '../../services/patientService'
import { useAuth } from '../../hooks/useAuth'
import { logActivity } from '../../services/activityLogService'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { TEST_RESULT_STATUS } from '../../utils/statusConstants'

const PendingApprovals = () => {
  const [results, setResults] = useState([])
  const [patients, setPatients] = useState([])
  const [testOrders, setTestOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const { userData } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [resultsData, patientsData, ordersData] = await Promise.all([
        getPendingResults(),
        getAllPatients(),
        getAllTestOrders(),
      ])
      setResults(resultsData)
      setPatients(patientsData)
      setTestOrders(ordersData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (resultId) => {
    if (!window.confirm('Are you sure you want to approve this result?')) return

    try {
      await updateTestResultStatus(
        resultId,
        TEST_RESULT_STATUS.APPROVED,
        userData.user_id
      )
      await logActivity(userData.user_id, 'test_result', 'approve', resultId)
      toast.success('Result approved successfully')
      fetchData()
    } catch (error) {
      console.error('Error approving result:', error)
      toast.error('Failed to approve result')
    }
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    if (!window.confirm('Are you sure you want to reject this result?')) return

    updateTestResultStatus(
      selectedResult.id,
      TEST_RESULT_STATUS.REJECTED,
      userData.user_id,
      rejectionReason
    )
      .then(() => {
        logActivity(userData.user_id, 'test_result', 'reject', selectedResult.id, {
          reason: rejectionReason,
        })
        toast.success('Result rejected')
        setIsModalOpen(false)
        setRejectionReason('')
        setSelectedResult(null)
        fetchData()
      })
      .catch((error) => {
        console.error('Error rejecting result:', error)
        toast.error('Failed to reject result')
      })
  }

  const handleReturnToTechnician = async (resultId) => {
    if (!window.confirm('Return this result to technician for correction?')) return

    try {
      await updateTestResultStatus(
        resultId,
        TEST_RESULT_STATUS.RETURNED,
        userData.user_id
      )
      await logActivity(userData.user_id, 'test_result', 'return', resultId)
      toast.success('Result returned to technician')
      fetchData()
    } catch (error) {
      console.error('Error returning result:', error)
      toast.error('Failed to return result')
    }
  }

  const openRejectModal = (result) => {
    setSelectedResult(result)
    setRejectionReason('')
    setIsModalOpen(true)
  }

  const getPatientName = (testOrderId) => {
    const order = testOrders.find((o) => o.id === testOrderId || o.test_order_id === testOrderId)
    if (!order) return 'Unknown'
    const patient = patients.find((p) => p.id === order.patient_id)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pending Approvals</h1>

      <Table
        headers={['Test Order ID', 'Patient', 'Test ID', 'Result Value', 'Reference Range', 'Actions']}
        className="bg-white rounded-lg shadow"
      >
        {results.map((result) => (
          <tr key={result.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {result.test_order_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {getPatientName(result.test_order_id)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {result.test_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
              {result.result_value}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {result.reference_range}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleApprove(result.id)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => openRejectModal(result)}
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleReturnToTechnician(result.id)}
              >
                Return
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedResult(null)
          setRejectionReason('')
        }}
        title="Reject Result"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this result. This reason will
            be logged and visible to the technician.
          </p>
          <Input
            label="Rejection Reason"
            name="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            required
            multiline={true}
            rows={4}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setSelectedResult(null)
                setRejectionReason('')
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Reject Result
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PendingApprovals

