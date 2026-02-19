'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/common/Header'

interface ReportData {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topProducts: any[]
  topCustomers: any[]
  monthlyRevenue: any[]
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    topCustomers: [],
    monthlyRevenue: [],
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchReports()
  }, [dateRange])

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `/api/reports?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      )
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatBox = ({ icon, title, value, color }: any) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )

  return (
    <div>
      <Header title="Sales Reports & Analytics" subtitle="View detailed sales and business metrics" />

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatBox
              icon="💰"
              title="Total Sales"
              value={`₹${reports.totalSales.toFixed(2)}`}
              color="border-green-500"
            />
            <StatBox
              icon="📊"
              title="Total Orders"
              value={reports.totalOrders}
              color="border-blue-500"
            />
            <StatBox
              icon="📈"
              title="Average Order Value"
              value={`₹${reports.averageOrderValue.toFixed(2)}`}
              color="border-purple-500"
            />
            <StatBox
              icon="🎯"
              title="Conversion Rate"
              value={reports.totalOrders > 0 ? ((reports.totalOrders / 100) * 100).toFixed(1) + '%' : '0%'}
              color="border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h3>
              <div className="space-y-3">
                {reports.topProducts.length > 0 ? (
                  reports.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </div>
                      <span className="text-gray-600 font-semibold">{product.sales} units</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No sales data available</p>
                )}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Top Customers</h3>
              <div className="space-y-3">
                {reports.topCustomers.length > 0 ? (
                  reports.topCustomers.map((customer, index) => (
                    <div key={index} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{customer.name}</span>
                      </div>
                      <span className="text-gray-600 font-semibold">₹{customer.spent}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No customer data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart (Text Based) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <div className="space-y-3">
              {reports.monthlyRevenue.length > 0 ? (
                reports.monthlyRevenue.map((month, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <span className="w-24 text-sm font-medium text-gray-600">{month.month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full flex items-center justify-end px-3"
                        style={{
                          width: `${(month.revenue / Math.max(...reports.monthlyRevenue.map((m: any) => m.revenue))) * 100}%`,
                        }}
                      >
                        <span className="text-xs font-bold text-white">₹{month.revenue}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No monthly data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
