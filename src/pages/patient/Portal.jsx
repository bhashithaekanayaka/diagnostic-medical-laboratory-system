import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getReportsByPatient } from '../../services/reportService'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const PatientPortal = () => {
  const { userData } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userData?.user_id) {
      fetchReports()
    }
  }, [userData])

  const fetchReports = async () => {
    try {
      // In a real implementation, you'd link patient_id to user_id
      // For now, this is a placeholder
      const data = await getReportsByPatient(userData.user_id)
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Portal</h1>
      <p className="text-gray-600 mb-6">Welcome, {userData?.full_name || 'Patient'}</p>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports available.</p>
        ) : (
          <Table
            headers={['Report ID', 'Type', 'Generated Date', 'Actions']}
          >
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {report.report_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.report_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {report.createdAt
                    ? new Date(report.createdAt.toDate()).toLocaleDateString()
                    : 'N/A'}
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
        )}
      </div>
    </div>
  )
}

export default PatientPortal

