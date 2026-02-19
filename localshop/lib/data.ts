// Global data store for development/demo purposes
// In production, use a proper database like MongoDB

export let store = {
  products: [
    {
      _id: '1',
      name: 'Sample Product 1',
      sku: 'SKU001',
      category: 'Electronics',
      price: 299.99,
      stock: 50,
      description: 'High quality electronic product',
    },
    {
      _id: '2',
      name: 'Sample Product 2',
      sku: 'SKU002',
      category: 'Groceries',
      price: 49.99,
      stock: 100,
      description: 'Premium quality groceries',
    },
  ],
  customers: [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      address: '123 Main St',
      city: 'New Delhi',
      totalSpent: 5000,
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '9876543211',
      address: '456 Side St',
      city: 'Mumbai',
      totalSpent: 8000,
    },
  ],
  orders: [
    {
      _id: '1',
      orderNumber: 'ORD-001',
      customerId: '1',
      customerName: 'John Doe',
      items: [
        {
          productId: '1',
          productName: 'Sample Product 1',
          quantity: 2,
          price: 299.99,
          total: 599.98,
        },
      ],
      subtotal: 599.98,
      tax: 29.99,
      total: 629.97,
      status: 'completed',
      date: new Date().toISOString(),
    },
  ],
}

export function addProduct(product: any) {
  const newProduct = { _id: Date.now().toString(), ...product }
  store.products.push(newProduct)
  return newProduct
}

export function updateProduct(id: string, data: any) {
  const index = store.products.findIndex((p) => p._id === id)
  if (index !== -1) {
    store.products[index] = { ...store.products[index], ...data }
    return store.products[index]
  }
  return null
}

export function deleteProduct(id: string) {
  store.products = store.products.filter((p) => p._id !== id)
}

export function addCustomer(customer: any) {
  const newCustomer = { _id: Date.now().toString(), totalSpent: 0, ...customer }
  store.customers.push(newCustomer)
  return newCustomer
}

export function updateCustomer(id: string, data: any) {
  const index = store.customers.findIndex((c) => c._id === id)
  if (index !== -1) {
    store.customers[index] = { ...store.customers[index], ...data }
    return store.customers[index]
  }
  return null
}

export function deleteCustomer(id: string) {
  store.customers = store.customers.filter((c) => c._id !== id)
}

export function addOrder(order: any) {
  const newOrder = { _id: Date.now().toString(), date: new Date().toISOString(), ...order }
  store.orders.push(newOrder)
  return newOrder
}

export function updateOrder(id: string, data: any) {
  const index = store.orders.findIndex((o) => o._id === id)
  if (index !== -1) {
    store.orders[index] = { ...store.orders[index], ...data }
    return store.orders[index]
  }
  return null
}

export function deleteOrder(id: string) {
  store.orders = store.orders.filter((o) => o._id !== id)
}
