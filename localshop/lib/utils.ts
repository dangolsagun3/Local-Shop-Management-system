// Utility functions for formatting and common operations

/**
 * Format currency values
 * @param value - Number to format
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = '₹'): string => {
  return `${currency}${value.toFixed(2)}`
}

/**
 * Format date to readable format
 * @param date - Date object or string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format time to readable format
 * @param date - Date object or string
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format datetime to readable format
 * @param date - Date object or string
 * @returns Formatted datetime string
 */
export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} ${formatTime(date)}`
}

/**
 * Validate email
 * @param email - Email to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Indian format)
 * @param phone - Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/[^\d]/g, ''))
}

/**
 * Calculate percentage
 * @param value - Value
 * @param total - Total
 * @returns Percentage as number
 */
export const calculatePercentage = (value: number, total: number): number => {
  return total === 0 ? 0 : (value / total) * 100
}

/**
 * Generate unique ID
 * @returns Unique ID string
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

/**
 * Capitalize first letter of string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Format order number with padding
 * @param orderNum - Order number
 * @returns Formatted order number
 */
export const formatOrderNumber = (orderNum: number): string => {
  return `ORD-${String(orderNum).padStart(5, '0')}`
}

/**
 * Calculate tax amount
 * @param amount - Base amount
 * @param taxPercentage - Tax percentage (default: 5)
 * @returns Tax amount
 */
export const calculateTax = (amount: number, taxPercentage: number = 5): number => {
  return parseFloat(((amount * taxPercentage) / 100).toFixed(2))
}

/**
 * Get status badge color
 * @param status - Status string
 * @returns Tailwind CSS class for badge color
 */
export const getStatusBadgeColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
    inactive: 'bg-gray-100 text-gray-800',
  }
  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

/**
 * Sort array of objects by property
 * @param array - Array to sort
 * @param property - Property to sort by
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array
 */
export const sortBy = <T extends Record<string, any>>(
  array: T[],
  property: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[property] > b[property] ? 1 : -1
    }
    return a[property] < b[property] ? 1 : -1
  })
}

/**
 * Filter array by multiple properties
 * @param array - Array to filter
 * @param filters - Object with property-value pairs to filter by
 * @returns Filtered array
 */
export const filterBy = <T extends Record<string, any>>(
  array: T[],
  filters: Partial<T>
): T[] => {
  return array.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(item[key])
      }
      return item[key] === value
    })
  })
}
