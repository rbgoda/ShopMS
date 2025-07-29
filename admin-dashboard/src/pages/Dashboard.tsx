import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardData {
  overview: {
    totalProducts: number
    totalCustomers: number
    totalOrders: number
    totalRevenue: number
    monthlyOrders: number
    monthlyRevenue: number
  }
  lowStockProducts: any[]
  topSellingProducts: any[]
  recentOrders: any[]
}

interface SalesData {
  dailySales: any[]
  orderStatusBreakdown: any[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [salesData, setSalesData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, analyticsRes] = await Promise.all([
        axios.get('/dashboard/overview'),
        axios.get('/dashboard/analytics')
      ])
      
      setData(overviewRes.data)
      setSalesData(analyticsRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Revenue',
      stat: `$${data?.overview.totalRevenue?.toLocaleString() || 0}`,
      previousStat: `$${data?.overview.monthlyRevenue?.toLocaleString() || 0} this month`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Total Orders',
      stat: data?.overview.totalOrders?.toLocaleString() || 0,
      previousStat: `${data?.overview.monthlyOrders || 0} this month`,
      icon: ClipboardDocumentListIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Products',
      stat: data?.overview.totalProducts?.toLocaleString() || 0,
      previousStat: 'Total products',
      icon: ShoppingBagIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Customers',
      stat: data?.overview.totalCustomers?.toLocaleString() || 0,
      previousStat: 'Total customers',
      icon: UsersIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your shop.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="card p-5">
            <div className="flex items-center">
              <div className={`p-3 rounded-md ${item.bgColor}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                <p className="text-sm text-gray-500">{item.previousStat}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Overview (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData?.dailySales || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData?.orderStatusBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data?.lowStockProducts?.slice(0, 5).map((product) => (
              <div key={product.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.inventory === 0 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.inventory} left
                </span>
              </div>
            )) || (
              <div className="px-6 py-4 text-sm text-gray-500">No low stock products</div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {data?.recentOrders?.slice(0, 5).map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customer?.firstName} {order.customer?.lastName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${order.totalAmount}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) || (
              <div className="px-6 py-4 text-sm text-gray-500">No recent orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}