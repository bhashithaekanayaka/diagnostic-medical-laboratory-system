import { useState, useEffect } from 'react'
import { getAllUsers } from '../../services/userService'
import { getAllPatients } from '../../services/patientService'
import { getAllTestOrders } from '../../services/testService'
import { getLowStockItems } from '../../services/inventoryService'
import DashboardCard from '../../components/common/DashboardCard'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalTestOrders: 0,
    lowStockItems: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, patients, testOrders, lowStock] = await Promise.all([
          getAllUsers(),
          getAllPatients(),
          getAllTestOrders(),
          getLowStockItems(),
        ])

        setStats({
          totalUsers: users.length,
          totalPatients: patients.length,
          totalTestOrders: testOrders.length,
          lowStockItems: lowStock.length,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
        />
        <DashboardCard
          title="Total Patients"
          value={stats.totalPatients}
          icon="👤"
          color="green"
        />
        <DashboardCard
          title="Test Orders"
          value={stats.totalTestOrders}
          icon="🧪"
          color="purple"
        />
        <DashboardCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon="⚠️"
          color="red"
        />
      </div>
    </div>
  )
}

export default AdminDashboard

