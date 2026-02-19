import { NextRequest, NextResponse } from 'next/server'
import { store, addOrder } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(store.orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newOrder = addOrder(data)
    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
