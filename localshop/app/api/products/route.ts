import { NextRequest, NextResponse } from 'next/server'
import { store, addProduct } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(store.products)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const newProduct = addProduct(data)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
