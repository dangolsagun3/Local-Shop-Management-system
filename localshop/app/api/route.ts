import { NextRequest, NextResponse } from 'next/server'

// Mock data storage (replace with database later)
let products: any[] = []
let customers: any[] = []
let orders: any[] = []

export async function GET(request: NextRequest, { params }: { params: { id?: string } }) {
  try {
    const path = request.nextUrl.pathname
    const pathSegments = path.split('/')

    if (pathSegments.includes('products')) {
      const productId = pathSegments[pathSegments.indexOf('products') + 1]
      if (productId) {
        const product = products.find((p) => p._id === productId)
        return product ? NextResponse.json(product) : NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json(products)
    }

    if (pathSegments.includes('customers')) {
      const customerId = pathSegments[pathSegments.indexOf('customers') + 1]
      if (customerId) {
        const customer = customers.find((c) => c._id === customerId)
        return customer ? NextResponse.json(customer) : NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json(customers)
    }

    if (pathSegments.includes('orders')) {
      const orderId = pathSegments[pathSegments.indexOf('orders') + 1]
      if (orderId) {
        const order = orders.find((o) => o._id === orderId)
        return order ? NextResponse.json(order) : NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      return NextResponse.json(orders)
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const path = request.nextUrl.pathname
    const pathSegments = path.split('/')

    if (pathSegments.includes('products')) {
      const newProduct = { ...data, _id: Date.now().toString() }
      products.push(newProduct)
      return NextResponse.json(newProduct, { status: 201 })
    }

    if (pathSegments.includes('customers')) {
      const newCustomer = { ...data, _id: Date.now().toString(), totalSpent: 0 }
      customers.push(newCustomer)
      return NextResponse.json(newCustomer, { status: 201 })
    }

    if (pathSegments.includes('orders')) {
      const newOrder = { ...data, _id: Date.now().toString(), date: new Date().toISOString() }
      orders.push(newOrder)
      return NextResponse.json(newOrder, { status: 201 })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const path = request.nextUrl.pathname
    const pathSegments = path.split('/')

    const getIdFromPath = (segments: string[], keyword: string) => {
      const index = segments.indexOf(keyword)
      return index !== -1 ? segments[index + 1] : null
    }

    const productId = getIdFromPath(pathSegments, 'products')
    if (productId) {
      const index = products.findIndex((p) => p._id === productId)
      if (index !== -1) {
        products[index] = { ...products[index], ...data }
        return NextResponse.json(products[index])
      }
    }

    const customerId = getIdFromPath(pathSegments, 'customers')
    if (customerId) {
      const index = customers.findIndex((c) => c._id === customerId)
      if (index !== -1) {
        customers[index] = { ...customers[index], ...data }
        return NextResponse.json(customers[index])
      }
    }

    const orderId = getIdFromPath(pathSegments, 'orders')
    if (orderId) {
      const index = orders.findIndex((o) => o._id === orderId)
      if (index !== -1) {
        orders[index] = { ...orders[index], ...data }
        return NextResponse.json(orders[index])
      }
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname
    const pathSegments = path.split('/')

    const getIdFromPath = (segments: string[], keyword: string) => {
      const index = segments.indexOf(keyword)
      return index !== -1 ? segments[index + 1] : null
    }

    const productId = getIdFromPath(pathSegments, 'products')
    if (productId) {
      products = products.filter((p) => p._id !== productId)
      return NextResponse.json({ message: 'Deleted successfully' })
    }

    const customerId = getIdFromPath(pathSegments, 'customers')
    if (customerId) {
      customers = customers.filter((c) => c._id !== customerId)
      return NextResponse.json({ message: 'Deleted successfully' })
    }

    const orderId = getIdFromPath(pathSegments, 'orders')
    if (orderId) {
      orders = orders.filter((o) => o._id !== orderId)
      return NextResponse.json({ message: 'Deleted successfully' })
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
