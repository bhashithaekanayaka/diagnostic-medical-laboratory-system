import { useState } from 'react'
import { createInvoice } from '../../services/invoiceService'
import { useAuth } from '../../context/AuthContext'
import { logActivity } from '../../services/activityLogService'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const InvoiceForm = ({ patients, onSuccess }) => {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    patient_id: '',
    test_order_id: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    tax: 0,
    discount: 0,
    due_date: '',
    notes: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }],
    })
  }

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newInvoice = await createInvoice(formData, userData.user_id)
      await logActivity(userData.user_id, 'invoice', 'create', newInvoice.id)
      toast.success('Invoice created successfully')
      onSuccess()
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error(error.message || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const patientOptions = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.full_name} (${patient.patient_id})`,
  }))

  const subtotal = formData.items.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * parseFloat(item.quantity || 0),
    0
  )
  const total = subtotal + parseFloat(formData.tax || 0) - parseFloat(formData.discount || 0)

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

      <Input
        label="Test Order ID (Optional)"
        name="test_order_id"
        value={formData.test_order_id}
        onChange={handleChange}
      />

      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Items</h3>
          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            Add Item
          </Button>
        </div>

        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 mb-4">
            <Input
              label="Item Name"
              name={`item_${index}_name`}
              value={item.name}
              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              required
            />
            <Input
              label="Quantity"
              name={`item_${index}_quantity`}
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              required
            />
            <Input
              label="Price (LKR)"
              name={`item_${index}_price`}
              type="number"
              step="0.01"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              required
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeItem(index)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Subtotal (LKR)"
          name="subtotal"
          value={subtotal.toFixed(2)}
          disabled
        />
        <Input
          label="Tax (LKR)"
          name="tax"
          type="number"
          step="0.01"
          value={formData.tax}
          onChange={handleChange}
        />
        <Input
          label="Discount (LKR)"
          name="discount"
          type="number"
          step="0.01"
          value={formData.discount}
          onChange={handleChange}
        />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-lg font-semibold">
          Total: LKR {total.toFixed(2)}
        </p>
      </div>

      <Input
        label="Due Date"
        name="due_date"
        type="date"
        value={formData.due_date}
        onChange={handleChange}
      />

      <Input
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  )
}

export default InvoiceForm

