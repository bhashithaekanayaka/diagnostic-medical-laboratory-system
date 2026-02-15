import { useState, useEffect } from 'react'
import { getAllTestOrders } from '../../services/testService'
import { getTestResultsByOrder } from '../../services/testService'
import { getAllPatients } from '../../services/patientService'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { TEST_RESULT_STATUS } from '../../utils/statusConstants'

const ApprovedReports = () => {
  const [results, setResults] = useState([])
  const [patients, setPatients] = useState([])
  const [testOrders, setTestOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersData, patientsData] = await Promise.all([
        getAllTestOrders(),
        getAllPatients(),
      ])
      setPatients(patientsData)
      setTestOrders(ordersData)

      // Get all results and filter for approved
      const allResults = []
      for (const order of ordersData) {
        const orderResults = await getTestResultsByOrder(order.id)
        allResults.push(
          ...orderResults.filter(
            (r) => r.status === TEST_RESULT_STATUS.APPROVED
          )
        )
      }
      setResults(allResults)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Approved Reports</h1>

      <Table
        headers={['Test Order ID', 'Patient', 'Test ID', 'Result Value', 'Reference Range', 'Status', 'Approved Date']}
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
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge variant="success">{result.status}</Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {result.approved_at
                ? new Date(result.approved_at.toDate()).toLocaleDateString()
                : 'N/A'}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export default ApprovedReports

