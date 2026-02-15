import { useState } from 'react'
import { createInventoryItem, updateInventoryItem } from '../../services/inventoryService'
import { useAuth } from '../../hooks/useAuth'
import { logActivity } from '../../services/activityLogService'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import toast from 'react-hot-toast'

const InventoryForm = ({ item, onSuccess }) => {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    item_name: item?.item_name || '',
    category: item?.category || '',
    quantity: item?.quantity || 0,
    unit: item?.unit || '',
    reorder_level: item?.reorder_level || 0,
    expiry_date: item?.expiry_date || '',
    supplier: item?.supplier || '',
    cost_per_unit: item?.cost_per_unit || 0,
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
      if (item) {
        await updateInventoryItem(item.id, formData, userData.user_id)
        await logActivity(userData.user_id, 'inventory', 'update', item.id)
        toast.success('Inventory item updated successfully')
      } else {
        const newItem = await createInventoryItem(formData, userData.user_id)
        await logActivity(userData.user_id, 'inventory', 'create', newItem.id)
        toast.success('Inventory item created successfully')
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving inventory item:', error)
      toast.error(error.message || 'Failed to save inventory item')
    } finally {
      setLoading(false)
    }
  }

  const categoryOptions = [
    { value: 'Reagents', label: 'Reagents' },
    { value: 'Consumables', label: 'Consumables' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Other', label: 'Other' },
  ]

  const unitOptions = [
    { value: 'units', label: 'Units' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'bottles', label: 'Bottles' },
    { value: 'packets', label: 'Packets' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Item Name"
        name="item_name"
        value={formData.item_name}
        onChange={handleChange}
        required
      />

      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={categoryOptions}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <Select
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          options={unitOptions}
          required
        />
      </div>

      <Input
        label="Reorder Level"
        name="reorder_level"
        type="number"
        value={formData.reorder_level}
        onChange={handleChange}
        required
      />

      <Input
        label="Expiry Date"
        name="expiry_date"
        type="date"
        value={formData.expiry_date}
        onChange={handleChange}
      />

      <Input
        label="Supplier"
        name="supplier"
        value={formData.supplier}
        onChange={handleChange}
      />

      <Input
        label="Cost Per Unit (LKR)"
        name="cost_per_unit"
        type="number"
        step="0.01"
        value={formData.cost_per_unit}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : item ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

export default InventoryForm

