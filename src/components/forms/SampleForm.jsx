import { useState } from 'react'
import { createSample } from '../../services/testService'
import { useAuth } from '../../context/AuthContext'
import { logActivity } from '../../services/activityLogService'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const SampleForm = ({ patients, onSuccess }) => {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: '',
    sample_type: '',
    collection_date: new Date().toISOString().split('T')[0],
    notes: '',
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
      const newSample = await createSample(formData, userData.user_id)
      await logActivity(userData.user_id, 'sample', 'create', newSample.id)
      toast.success('Sample collected successfully')
      onSuccess()
    } catch (error) {
      console.error('Error creating sample:', error)
      toast.error(error.message || 'Failed to collect sample')
    } finally {
      setLoading(false)
    }
  }

  const patientOptions = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.full_name} (${patient.patient_id})`,
  }))

  const sampleTypeOptions = [
    { value: 'Blood', label: 'Blood' },
    { value: 'Urine', label: 'Urine' },
    { value: 'Stool', label: 'Stool' },
    { value: 'Sputum', label: 'Sputum' },
    { value: 'Other', label: 'Other' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Patient"
        name="patient_id"
        value={formData.patient_id}
        onChange={handleChange}
        options={patientOptions}
        required
      />

      <Select
        label="Sample Type"
        name="sample_type"
        value={formData.sample_type}
        onChange={handleChange}
        options={sampleTypeOptions}
        required
      />

      <Input
        label="Collection Date"
        name="collection_date"
        type="date"
        value={formData.collection_date}
        onChange={handleChange}
        required
      />

      <Input
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Additional notes..."
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Collecting...' : 'Collect Sample'}
        </Button>
      </div>
    </form>
  )
}

export default SampleForm

