import { useState, useEffect } from 'react'
import { getAllSamples, createSample, updateSampleStatus } from '../../services/testService'
import { getAllPatients } from '../../services/patientService'
import { useAuth } from '../../context/AuthContext'
import { logActivity } from '../../services/activityLogService'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import SampleForm from '../../components/forms/SampleForm'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { SAMPLE_STATUS } from '../../utils/statusConstants'

const SampleCollection = () => {
  const [samples, setSamples] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { userData } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [samplesData, patientsData] = await Promise.all([
        getAllSamples(),
        getAllPatients(),
      ])
      setSamples(samplesData)
      setPatients(patientsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSample = () => {
    setIsModalOpen(true)
  }

  const handleCollectSample = async (sampleId) => {
    try {
      await updateSampleStatus(sampleId, SAMPLE_STATUS.COLLECTED, userData.user_id)
      await logActivity(userData.user_id, 'sample', 'update', sampleId, {
        status: SAMPLE_STATUS.COLLECTED,
      })
      toast.success('Sample marked as collected')
      fetchData()
    } catch (error) {
      console.error('Error updating sample:', error)
      toast.error('Failed to update sample')
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sample Collection</h1>
        <Button onClick={handleCreateSample}>Collect Sample</Button>
      </div>

      <Table
        headers={['Sample ID', 'Patient', 'Sample Type', 'Collection Date', 'Status', 'Actions']}
        className="bg-white rounded-lg shadow"
      >
        {samples.map((sample) => (
          <tr key={sample.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {sample.sample_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {getPatientName(sample.patient_id)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {sample.sample_type}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {sample.collection_date}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge
                variant={
                  sample.status === SAMPLE_STATUS.COLLECTED
                    ? 'success'
                    : sample.status === SAMPLE_STATUS.REJECTED
                    ? 'danger'
                    : 'warning'
                }
              >
                {sample.status}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              {sample.status === SAMPLE_STATUS.PENDING && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCollectSample(sample.id)}
                >
                  Mark Collected
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Collect Sample"
        size="md"
      >
        <SampleForm
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

export default SampleCollection

