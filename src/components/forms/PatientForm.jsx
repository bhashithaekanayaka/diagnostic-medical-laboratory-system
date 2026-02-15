import { useState } from 'react'
import { createPatient, updatePatient } from '../../services/patientService'
import { useAuth } from '../../hooks/useAuth'
import { logActivity } from '../../services/activityLogService'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const PatientForm = ({ patient, onSuccess }) => {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: patient?.full_name || '',
    nic: patient?.nic || '',
    date_of_birth: patient?.date_of_birth || '',
    gender: patient?.gender || '',
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (patient) {
        await updatePatient(patient.id, formData, userData.user_id)
        await logActivity(userData.user_id, 'patient', 'update', patient.id)
        toast.success('Patient updated successfully')
      } else {
        const newPatient = await createPatient(formData, userData.user_id)
        await logActivity(userData.user_id, 'patient', 'create', newPatient.id)
        toast.success('Patient registered successfully')
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving patient:', error)
      toast.error(error.message || 'Failed to save patient')
    } finally {
      setLoading(false)
    }
  }

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="full_name"
        value={formData.full_name}
        onChange={handleChange}
        required
      />

      <Input
        label="NIC"
        name="nic"
        value={formData.nic}
        onChange={handleChange}
        placeholder="123456789V or 123456789012"
        required
      />

      <Input
        label="Date of Birth"
        name="date_of_birth"
        type="date"
        value={formData.date_of_birth}
        onChange={handleChange}
        required
      />

      <Select
        label="Gender"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        options={genderOptions}
        required
      />

      <Input
        label="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="0712345678"
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />

      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : patient ? 'Update' : 'Register'}
        </Button>
      </div>
    </form>
  )
}

export default PatientForm

