import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Mock data - in production, aggregate from database based on date range
    const reportData = {
      totalSales: 45000,
      totalOrders: 80,
      averageOrderValue: 562.5,
      topProducts: [
        { name: 'Premium Electronics', sales: 45 },
        { name: 'Clothing Essentials', sales: 38 },
        { name: 'Home Appliances', sales: 25 },
        { name: 'Books & Media', sales: 18 },
        { name: 'Sports Equipment', sales: 12 },
      ],
      topCustomers: [
        { name: 'John Doe', spent: 5000 },
        { name: 'Jane Smith', spent: 8000 },
        { name: 'Mike Johnson', spent: 3500 },
        { name: 'Sarah Williams', spent: 6200 },
      ],
      monthlyRevenue: [
        { month: 'January', revenue: 2500 },
        { month: 'February', revenue: 3200 },
        { month: 'March', revenue: 5100 },
        { month: 'April', revenue: 4800 },
        { month: 'May', revenue: 6300 },
        { month: 'June', revenue: 8000 },
        { month: 'July', revenue: 7500 },
        { month: 'August', revenue: 9200 },
        { month: 'September', revenue: 6800 },
        { month: 'October', revenue: 7200 },
        { month: 'November', revenue: 8900 },
        { month: 'December', revenue: 9300 },
      ],
    }

    return NextResponse.json(reportData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
