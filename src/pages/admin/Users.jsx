import { useState, useEffect } from 'react'
import { getAllUsers, updateUserStatus, deleteUser } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import { logActivity } from '../../services/activityLogService'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import UserForm from '../../components/forms/UserForm'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { USER_STATUS } from '../../utils/statusConstants'
import { ROLES } from '../../utils/roleConstants'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const { userData } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDisableUser = async (userId) => {
    if (!window.confirm('Are you sure you want to disable this user?')) return

    try {
      await updateUserStatus(userId, USER_STATUS.INACTIVE, userData.user_id)
      await logActivity(
        userData.user_id,
        'user',
        'disable',
        userId,
        { status: USER_STATUS.INACTIVE }
      )
      toast.success('User disabled successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error disabling user:', error)
      toast.error('Failed to disable user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      await deleteUser(userId, userData.user_id)
      await logActivity(userData.user_id, 'user', 'delete', userId)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
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
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Button onClick={handleCreateUser}>Create User</Button>
      </div>

      <Table
        headers={['Name', 'Email', 'Role', 'Status', 'Actions']}
        className="bg-white rounded-lg shadow"
      >
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {user.full_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {user.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {user.role}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <Badge
                variant={
                  user.status === USER_STATUS.ACTIVE ? 'success' : 'danger'
                }
              >
                {user.status}
              </Badge>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditUser(user)}
              >
                Edit
              </Button>
              {user.status === USER_STATUS.ACTIVE ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDisableUser(user.user_id)}
                >
                  Disable
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() =>
                    updateUserStatus(user.user_id, USER_STATUS.ACTIVE, userData.user_id)
                      .then(() => {
                        toast.success('User enabled')
                        fetchUsers()
                      })
                  }
                >
                  Enable
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteUser(user.user_id)}
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
        title={selectedUser ? 'Edit User' : 'Create User'}
        size="md"
      >
        <UserForm
          user={selectedUser}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchUsers()
          }}
        />
      </Modal>
    </div>
  )
}

export default AdminUsers

