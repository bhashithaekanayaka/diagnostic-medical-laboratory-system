import { useState, useEffect } from 'react'
import { getAllPatients } from '../../services/patientService'
import { getAllSamples, getAllTestOrders } from '../../services/testService'
import { getAllInvoices } from '../../services/invoiceService'
import DashboardCard from '../../components/common/DashboardCard'

const StaffDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingSamples: 0,
    activeTestOrders: 0,
    pendingInvoices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, samples, testOrders, invoices] = await Promise.all([
          getAllPatients(),
          getAllSamples(),
          getAllTestOrders(),
          getAllInvoices(),
        ])

        const pendingSamples = samples.filter(
          (s) => s.status === 'Pending' || s.status === 'Collected'
        ).length

        const activeTestOrders = testOrders.filter(
          (t) => t.status === 'Pending' || t.status === 'In Progress'
        ).length

        const pendingInvoices = invoices.filter(
          (i) => i.status === 'Pending'
        ).length

        setStats({
          totalPatients: patients.length,
          pendingSamples,
          activeTestOrders,
          pendingInvoices,
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Staff Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Patients"
          value={stats.totalPatients}
          icon="👤"
          color="blue"
        />
        <DashboardCard
          title="Pending Samples"
          value={stats.pendingSamples}
          icon="🧪"
          color="yellow"
        />
        <DashboardCard
          title="Active Test Orders"
          value={stats.activeTestOrders}
          icon="📋"
          color="purple"
        />
        <DashboardCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon="💰"
          color="red"
        />
      </div>
    </div>
  )
}

export default StaffDashboard

