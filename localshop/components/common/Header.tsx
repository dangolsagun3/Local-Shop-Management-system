'use client'

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  )
}
