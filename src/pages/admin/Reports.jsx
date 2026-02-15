import { useState, useEffect } from 'react'
import { getAllReports } from '../../services/reportService'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/formatDate'

const AdminReports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const data = await getAllReports()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (report) => {
    if (report.file_url) {
      window.open(report.file_url, '_blank')
    } else {
      toast.error('Report file not available')
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>

      <Table
        headers={['Report ID', 'Patient ID', 'Type', 'Generated Date', 'Actions']}
        className="bg-white rounded-lg shadow"
      >
        {reports.map((report) => (
          <tr key={report.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {report.report_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {report.patient_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {report.report_type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {report.createdAt ? formatDate(report.createdAt.toDate()) : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload(report)}
              >
                Download
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

export default AdminReports

