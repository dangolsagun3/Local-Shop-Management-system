import { NextRequest, NextResponse } from 'next/server'
import { store, addCustomer } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(store.customers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newCustomer = addCustomer(data)
    return NextResponse.json(newCustomer, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
