'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/products', label: 'Products', icon: '📦' },
    { href: '/dashboard/customers', label: 'Customers', icon: '👥' },
    { href: '/dashboard/orders', label: 'Orders', icon: '🧾' },
    { href: '/dashboard/reports', label: 'Reports', icon: '📈' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/Login')
  }

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-600 to-indigo-800 min-h-screen text-white transition-all duration-300 flex flex-col`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-indigo-500 flex items-center justify-between">
        {isOpen && <h1 className="text-2xl font-bold">ShopX</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-indigo-700 rounded-lg transition"
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              pathname === item.href
                ? 'bg-white text-indigo-600 font-semibold'
                : 'hover:bg-indigo-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-indigo-500">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition font-medium"
        >
          <span>🚪</span>
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}
