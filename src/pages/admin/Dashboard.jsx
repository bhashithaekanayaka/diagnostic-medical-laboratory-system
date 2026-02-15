import { useState, useEffect } from 'react'
import { getAllUsers } from '../../services/userService'
import { getAllPatients } from '../../services/patientService'
import { getAllTestOrders } from '../../services/testService'
import { getLowStockItems } from '../../services/inventoryService'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 1284,
    pendingTests: 42,
    inventoryAlerts: 8,
    monthlyRevenue: 42500,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [patients, testOrders, lowStock] = await Promise.all([
          getAllPatients(),
          getAllTestOrders(),
          getLowStockItems(),
        ])

        // Filter pending tests
        const pendingTests = testOrders.filter(
          (order) => order.status === 'Pending' || order.status === 'In Progress'
        )

        setStats({
          totalPatients: patients.length || 1284,
          pendingTests: pendingTests.length || 42,
          inventoryAlerts: lowStock.length || 8,
          monthlyRevenue: 42500, // This would come from invoice service
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500">
            Welcome back! Here's what's happening at Central Labs today.
          </p>
        </div>
        <button
          onClick={() => navigate('/staff/patients')}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-icons text-[18px]">add</span>
          New Patient Entry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Patients Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <span className="material-icons">person_add</span>
            </div>
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-icons text-[14px]">trending_up</span> 12%
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Total Patients</h3>
          <p className="text-2xl font-bold mt-1">{stats.totalPatients.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">
            v.s. last month ({Math.floor(stats.totalPatients * 0.89).toLocaleString()})
          </p>
        </div>

        {/* Pending Tests Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <span className="material-icons">hourglass_empty</span>
            </div>
            <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-1 rounded-full">
              In Progress
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Pending Tests</h3>
          <p className="text-2xl font-bold mt-1">{stats.pendingTests}</p>
          <p className="text-xs text-slate-400 mt-2">12 Urgent priority cases</p>
        </div>

        {/* Inventory Alerts Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <span className="material-icons">warning</span>
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              Critical
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Inventory Alerts</h3>
          <p className="text-2xl font-bold mt-1">
            {String(stats.inventoryAlerts).padStart(2, '0')}
          </p>
          <p className="text-xs text-slate-400 mt-2">Low stock reagents detected</p>
        </div>

        {/* Monthly Revenue Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <span className="material-icons">account_balance_wallet</span>
            </div>
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="material-icons text-[14px]">trending_up</span> 8.4%
            </span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Monthly Revenue</h3>
          <p className="text-2xl font-bold mt-1">${stats.monthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Target: $50,000</p>
        </div>
      </div>

      {/* Main Dashboard Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Test Volume Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Monthly Test Volume</h3>
            <select className="bg-slate-50 border-none rounded-lg text-xs font-medium py-1.5 focus:ring-1 focus:ring-primary/20 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="relative h-64 w-full flex items-end justify-between gap-2 pt-10">
            {/* Simulated Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-10 opacity-10">
              <div className="border-t border-slate-900"></div>
              <div className="border-t border-slate-900"></div>
              <div className="border-t border-slate-900"></div>
            </div>
            {/* Chart Bars */}
            {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'].map((month, index) => {
              const heights = [32, 40, 24, 48, 36, 52]
              const isCurrent = month === 'APR'
              return (
                <div
                  key={month}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isCurrent
                        ? 'bg-primary/30 border-b-4 border-primary'
                        : 'bg-primary/10 group-hover:bg-primary/20'
                    }`}
                    style={{ height: `${heights[index]}%` }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary absolute"
                    style={{ bottom: `${heights[index] + 8}%` }}
                  ></div>
                  <span
                    className={`text-[10px] mt-2 ${
                      isCurrent ? 'text-primary font-bold' : 'text-slate-400'
                    }`}
                  >
                    {month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity Log Preview */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <a
              className="text-primary text-xs font-semibold hover:underline"
              href="#"
              onClick={(e) => {
                e.preventDefault()
              }}
            >
              View All
            </a>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
            {[
              {
                icon: 'receipt',
                bg: 'bg-blue-100',
                textColor: 'text-blue-600',
                title: "Sarah Chen's CBC result verified",
                time: '2 minutes ago • Lab Tech: J. Doe',
              },
              {
                icon: 'inventory_2',
                bg: 'bg-emerald-100',
                textColor: 'text-emerald-600',
                title: 'Reagent XR-20 restocked',
                time: '14 minutes ago • Inventory Dept',
              },
              {
                icon: 'person_add',
                bg: 'bg-amber-100',
                textColor: 'text-amber-600',
                title: 'New patient Marcus Wright registered',
                time: '45 minutes ago • Front Desk',
              },
              {
                icon: 'science',
                bg: 'bg-blue-100',
                textColor: 'text-blue-600',
                title: 'Sample #28912 received in Lab B',
                time: '1 hour ago • Dr. Miller',
              },
              {
                icon: 'error_outline',
                bg: 'bg-red-100',
                textColor: 'text-red-600',
                title: 'Calibration failed on Unit 4',
                time: '3 hours ago • System Alert',
                isError: true,
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0"
              >
                <div
                  className={`w-8 h-8 rounded-full ${activity.bg} ${activity.textColor} flex items-center justify-center shrink-0`}
                >
                  <span className="material-icons text-[16px]">{activity.icon}</span>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      activity.isError ? 'text-red-600' : ''
                    }`}
                  >
                    {activity.title.split(' ').map((word, i) =>
                      word.startsWith('#') ||
                      word === "Sarah" ||
                      word === "Sarah's" ||
                      word === 'Marcus' ||
                      word === 'XR-20' ? (
                        <span key={i} className="font-bold">
                          {word}{' '}
                        </span>
                      ) : (
                        word + ' '
                      )
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Tests Queue Table */}
      <div className="mt-8 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold">Active Tests Queue</h3>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-icons">filter_list</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <span className="material-icons">download</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-bold">Patient / ID</th>
                <th className="px-6 py-4 font-bold">Test Type</th>
                <th className="px-6 py-4 font-bold">Assigned To</th>
                <th className="px-6 py-4 font-bold">Progress</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  initials: 'EL',
                  name: 'Elena Lindstrom',
                  id: '#LAB-94821',
                  test: 'Lipid Profile',
                  category: 'Biochemistry',
                  assigned: 'Dr. Aris V.',
                  progress: 85,
                  status: 'Processing',
                  statusColor: 'bg-blue-100 text-blue-600',
                },
                {
                  initials: 'JD',
                  name: 'Johnathan Doe',
                  id: '#LAB-94825',
                  test: 'HbA1c Diabetic',
                  category: 'Immunology',
                  assigned: 'Dr. Simon K.',
                  progress: 100,
                  status: 'Completed',
                  statusColor: 'bg-emerald-100 text-emerald-600',
                },
                {
                  initials: 'RS',
                  name: 'Rita Sanchez',
                  id: '#LAB-94830',
                  test: 'Full Blood Count',
                  category: 'Hematology',
                  assigned: null,
                  progress: 15,
                  status: 'Pending',
                  statusColor: 'bg-amber-100 text-amber-600',
                },
              ].map((test, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {test.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{test.name}</p>
                        <p className="text-[10px] text-slate-400">{test.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{test.test}</p>
                    <p className="text-[10px] text-slate-400">{test.category}</p>
                  </td>
                  <td className="px-6 py-4">
                    {test.assigned ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {test.assigned.split(' ')[1]?.[0] || 'D'}
                        </div>
                        <span className="text-sm">{test.assigned}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="material-icons text-[20px]">person_outline</span>
                        <span className="text-sm">Unassigned</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          test.progress === 100
                            ? 'bg-emerald-500'
                            : test.progress < 30
                            ? 'bg-amber-500'
                            : 'bg-primary'
                        }`}
                        style={{ width: `${test.progress}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${test.statusColor} uppercase tracking-wide`}
                    >
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <span className="material-icons text-[20px]">more_horiz</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors">
            Load More Active Tests
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
