import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import Header from '../components/common/Header'

const AdminLayout = () => {
  return (
    <div className="bg-background-light font-display text-slate-900 min-h-screen flex">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen">
        <Header />
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
