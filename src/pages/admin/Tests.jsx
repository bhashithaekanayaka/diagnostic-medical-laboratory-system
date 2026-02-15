import { useState, useEffect } from 'react'
import { getAllTestOrders, getAllTestResultsByOrder } from '../../services/testService'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { TEST_ORDER_STATUS, TEST_RESULT_STATUS } from '../../utils/statusConstants'

const AdminTests = () => {
  const [testOrders, setTestOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestOrders()
  }, [])

  const fetchTestOrders = async () => {
    try {
      const data = await getAllTestOrders()
      setTestOrders(data)
    } catch (error) {
      console.error('Error fetching test orders:', error)
    } finally {
      setLoading(false)
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Orders</h1>

      <Table
        headers={['Order ID', 'Patient ID', 'Sample ID', 'Status', 'Created Date']}
        className="bg-white rounded-lg shadow"
      >
        {testOrders.map((order) => (
          <tr key={order.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {order.test_order_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {order.patient_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {order.sample_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge
                variant={
                  order.status === TEST_ORDER_STATUS.COMPLETED
                    ? 'success'
                    : order.status === TEST_ORDER_STATUS.CANCELLED
                    ? 'danger'
                    : 'warning'
                }
              >
                {order.status}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {order.createdAt
                ? new Date(order.createdAt.toDate()).toLocaleDateString()
                : 'N/A'}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export default AdminTests

