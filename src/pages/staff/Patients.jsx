import { useState, useEffect } from 'react'
import { getAllPatients, deletePatient } from '../../services/patientService'
import { useAuth } from '../../context/AuthContext'
import { logActivity } from '../../services/activityLogService'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import PatientForm from '../../components/forms/PatientForm'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { PATIENT_STATUS } from '../../utils/statusConstants'

const StaffPatients = () => {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const { userData } = useAuth()

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const data = await getAllPatients()
      setPatients(data)
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePatient = () => {
    setSelectedPatient(null)
    setIsModalOpen(true)
  }

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return

    try {
      await deletePatient(patientId, userData.user_id)
      await logActivity(userData.user_id, 'patient', 'delete', patientId)
      toast.success('Patient deleted successfully')
      fetchPatients()
    } catch (error) {
      console.error('Error deleting patient:', error)
      toast.error('Failed to delete patient')
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
        <Button onClick={handleCreatePatient}>Register Patient</Button>
      </div>

      <Table
        headers={['Patient ID', 'Name', 'NIC', 'Phone', 'Status', 'Actions']}
        className="bg-white rounded-lg shadow"
      >
        {patients.map((patient) => (
          <tr key={patient.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {patient.patient_id}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {patient.full_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {patient.nic}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {patient.phone}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge
                variant={
                  patient.status === PATIENT_STATUS.ACTIVE
                    ? 'success'
                    : 'danger'
                }
              >
                {patient.status}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditPatient(patient)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeletePatient(patient.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPatient ? 'Edit Patient' : 'Register Patient'}
        size="lg"
      >
        <PatientForm
          patient={selectedPatient}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchPatients()
          }}
        />
      </Modal>
    </div>
  )
}

export default StaffPatients

