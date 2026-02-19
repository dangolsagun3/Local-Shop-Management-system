'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'

interface DashboardStats {
  totalProducts: number
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  todaySales: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todaySales: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon, title, value, color }: any) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  )

  return (
    <div>
      <Header title="Dashboard" subtitle="Welcome back! Here's your shop overview." />

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading statistics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon="📦"
            title="Total Products"
            value={stats.totalProducts}
            color="border-blue-500"
          />
          <StatCard
            icon="👥"
            title="Total Customers"
            value={stats.totalCustomers}
            color="border-green-500"
          />
          <StatCard
            icon="🧾"
            title="Total Orders"
            value={stats.totalOrders}
            color="border-purple-500"
          />
          <StatCard
            icon="💰"
            title="Total Revenue"
            value={`₹${stats.totalRevenue}`}
            color="border-yellow-500"
          />
          <StatCard
            icon="📈"
            title="Today's Sales"
            value={`₹${stats.todaySales}`}
            color="border-red-500"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/dashboard/products"
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <span className="text-2xl">➕</span>
            <span className="font-semibold text-gray-700">Add Product</span>
          </a>
          <a
            href="/dashboard/customers"
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <span className="text-2xl">👤</span>
            <span className="font-semibold text-gray-700">Add Customer</span>
          </a>
          <a
            href="/dashboard/orders"
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
          >
            <span className="text-2xl">🛒</span>
            <span className="font-semibold text-gray-700">New Order</span>
          </a>
          <a
            href="/dashboard/reports"
            className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
          >
            <span className="text-2xl">📊</span>
            <span className="font-semibold text-gray-700">View Reports</span>
          </a>
        </div>
      </div>
    </div>
  )
}
