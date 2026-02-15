import { useState, useEffect } from 'react'
import { getPendingResults } from '../../services/testService'
import DashboardCard from '../../components/common/DashboardCard'

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const pending = await getPendingResults()
        setStats({
          pendingApprovals: pending.length,
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Doctor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon="⏳"
          color="yellow"
        />
      </div>
    </div>
  )
}

export default DoctorDashboard

