import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data - in production, this will come from the database
    const stats = {
      totalProducts: 150,
      totalCustomers: 45,
      totalOrders: 120,
      totalRevenue: 75000,
      todaySales: 5200,
    }
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
