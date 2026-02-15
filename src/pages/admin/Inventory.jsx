import { useState, useEffect } from 'react'
import { getAllInventoryItems, getLowStockItems } from '../../services/inventoryService'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import InventoryForm from '../../components/forms/InventoryForm'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { INVENTORY_STATUS } from '../../utils/statusConstants'

const AdminInventory = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const data = await getAllInventoryItems()
      setItems(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('Failed to fetch inventory items')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateItem = () => {
    setSelectedItem(null)
    setIsModalOpen(true)
  }

  const handleEditItem = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
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
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <Button onClick={handleCreateItem}>Add Item</Button>
      </div>

      <Table
        headers={['Item Name', 'Category', 'Quantity', 'Unit', 'Reorder Level', 'Status', 'Actions']}
        className="bg-white rounded-lg shadow"
      >
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {item.item_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.category}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.quantity}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.unit}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.reorder_level}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge
                variant={
                  item.status === INVENTORY_STATUS.AVAILABLE
                    ? 'success'
                    : item.status === INVENTORY_STATUS.LOW_STOCK
                    ? 'warning'
                    : 'danger'
                }
              >
                {item.status}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditItem(item)}
              >
                Edit
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? 'Edit Item' : 'Add Item'}
        size="md"
      >
        <InventoryForm
          item={selectedItem}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchItems()
          }}
        />
      </Modal>
    </div>
  )
}

export default AdminInventory

