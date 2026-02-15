import { useState } from 'react'
import { createUser, updateUser } from '../../services/userService'
import { useAuth } from '../../hooks/useAuth'
import { logActivity } from '../../services/activityLogService'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import toast from 'react-hot-toast'
import { ROLES } from '../../utils/roleConstants'

const UserForm = ({ user, onSuccess }) => {
  const { userData } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || '',
    phone: user?.phone || '',
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
      if (user) {
        // Update existing user
        await updateUser(user.user_id, formData, userData.user_id)
        await logActivity(userData.user_id, 'user', 'update', user.user_id)
        toast.success('User updated successfully')
      } else {
        // Create new user
        if (!formData.password) {
          toast.error('Password is required for new users')
          setLoading(false)
          return
        }
        const newUser = await createUser(formData, userData.user_id)
        await logActivity(userData.user_id, 'user', 'create', newUser.id)
        toast.success('User created successfully')
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error(error.message || 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = Object.values(ROLES).map((role) => ({
    value: role,
    label: role,
  }))

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
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={!!user}
      />

      {!user && (
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      )}

      <Select
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={roleOptions}
        required
      />

      <Input
        label="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : user ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

export default UserForm

