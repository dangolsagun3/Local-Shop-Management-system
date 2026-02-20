# 📚 Developer Guide - Local Shop Management System

## Project Architecture

### Frontend Architecture
```
┌─────────────────────────────────────┐
│         Next.js App Router          │
├─────────────────────────────────────┤
│  Pages (Auth, Dashboard, etc)       │
│  ├─ (authpage)/                     │
│  ├─ dashboard/                      │
│  └─ api/                            │
├─────────────────────────────────────┤
│  Components (Sidebar, Modal, etc)   │
├─────────────────────────────────────┤
│  Utilities (API, Utils, Data)       │
├─────────────────────────────────────┤
│  Context API (Future)               │
├─────────────────────────────────────┤
│  Tailwind CSS Styling               │
└─────────────────────────────────────┘
```

---

## Code Organization

### Pages (Routes)
- **Authentication**: `/app/(authpage)/`
  - `Login/page.tsx` - Login form
  - `SignUpPage/page.tsx` - Registration form
  - `ForgotPassword/page.tsx` - Password recovery

- **Dashboard**: `/app/dashboard/`
  - `page.tsx` - Main dashboard
  - `products/page.tsx` - Product management
  - `customers/page.tsx` - Customer management
  - `orders/page.tsx` - Order & billing
  - `reports/page.tsx` - Analytics & reports

### API Routes
- `/app/api/products/` - Product CRUD operations
- `/app/api/customers/` - Customer CRUD operations
- `/app/api/orders/` - Order CRUD operations
- `/app/api/dashboard/stats` - Dashboard statistics
- `/app/api/reports` - Analytics data

### Components
- `/components/common/Sidebar.tsx` - Navigation
- `/components/common/Header.tsx` - Page headers
- `/components/common/Modal.tsx` - Dialog component

### Libraries & Utils
- `/lib/data.ts` - Mock data store
- `/lib/api.ts` - API helper functions
- `/lib/utils.ts` - Utility functions

### Context
- `/context/AuthContext.tsx` - Authentication state (skeleton)

---

## Adding New Features

### Adding a New Page

1. **Create page structure**
```bash
mkdir -p app/dashboard/new-feature
touch app/dashboard/new-feature/page.tsx
```

2. **Create page component**
```tsx
'use client'

import Header from '@/components/common/Header'

export default function NewFeaturePage() {
  return (
    <div>
      <Header title="Feature Title" subtitle="Feature description" />
      {/* Your content here */}
    </div>
  )
}
```

3. **Update sidebar navigation** in `components/common/Sidebar.tsx`
```tsx
const menuItems = [
  // ... existing items
  { href: '/dashboard/new-feature', label: 'New Feature', icon: '📋' },
]
```

### Adding a New API Endpoint

1. **Create route file**
```bash
mkdir -p app/api/new-feature
touch app/api/new-feature/route.ts
```

2. **Implement handlers**
```tsx
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // Your logic here
    return NextResponse.json(newData, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 })
  }
}
```

3. **Add API helper** in `lib/api.ts`
```tsx
export const newFeatureAPI = {
  getAll: () => apiCall('/api/new-feature'),
  create: (data: any) => apiCall('/api/new-feature', { method: 'POST', body: data }),
  // ... more methods
}
```

### Adding a New Component

1. **Create component file**
```bash
touch components/common/NewComponent.tsx
```

2. **Create reusable component**
```tsx
'use client'

interface NewComponentProps {
  title: string
  children?: React.ReactNode
}

export default function NewComponent({ title, children }: NewComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}
```

3. **Use in pages**
```tsx
import NewComponent from '@/components/common/NewComponent'

export default function SomePage() {
  return (
    <NewComponent title="My Component">
      <p>Content here</p>
    </NewComponent>
  )
}
```

---

## Data Flow

### Fetching Data
```
Component (page.tsx)
    ↓
useEffect() - triggers on mount
    ↓
API call (fetch or apiCall helper)
    ↓
API Route (/api/...)
    ↓
Data Store (lib/data.ts - currently in-memory)
    ↓
Return JSON response
    ↓
setState() - update component state
    ↓
Re-render with new data
```

### Creating Data
```
Form submission
    ↓
handleSubmit() prevents default
    ↓
API call (POST request)
    ↓
API Route creates new item
    ↓
Data added to store
    ↓
Return new item data
    ↓
Refresh list with fetchData()
    ↓
Close modal
    ↓
Show success message
```

---

## Styling Guidelines

### Color Scheme
```
Primary: Indigo-600 (#4F46E5)
Success: Green-600 (#16A34A)
Warning: Yellow-600 (#CA8A04)
Danger: Red-600 (#DC2626)
Info: Blue-600 (#2563EB)
Dark: Gray-900 (#111827)
Light: Gray-50 (#F9FAFB)
```

### Component Structure
```tsx
// Container
<div className="bg-white rounded-lg shadow-md p-6">
  
  // Header
  <div className="mb-6">
    <h1 className="text-3xl font-bold text-gray-900">Title</h1>
    <p className="text-gray-600">Subtitle</p>
  </div>

  // Content
  <div className="space-y-4">
    {/* Items */}
  </div>

  // Actions
  <div className="flex justify-end space-x-4 pt-4">
    <button>Cancel</button>
    <button>Submit</button>
  </div>

</div>
```

### Form Inputs
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Label
  </label>
  <input
    type="text"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
    placeholder="Placeholder"
  />
</div>
```

---

## Best Practices

### 1. Component Naming
- Use PascalCase for components: `MyComponent.tsx`
- Use kebab-case for files: `my-component.tsx`
- Use descriptive names: `ProductTable.tsx` not `Table.tsx`

### 2. Props & Typing
```tsx
interface Props {
  title: string
  onClick: () => void
  children?: React.ReactNode
  className?: string
}

export default function Component({ title, onClick, children, className }: Props) {
  // ...
}
```

### 3. API Response Handling
```tsx
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetch = async () => {
    try {
      const data = await apiCall('/api/endpoint')
      setState(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  fetch()
}, [])
```

### 4. Conditional Rendering
```tsx
{loading ? (
  <div>Loading...</div>
) : error ? (
  <div className="text-red-600">{error}</div>
) : data.length === 0 ? (
  <div>No data found</div>
) : (
  <div>{/* Content */}</div>
)}
```

### 5. Error Handling
- Always handle API errors
- Show user-friendly error messages
- Log errors for debugging
- Don't expose sensitive info

### 6. Performance
- Use lazy loading for images
- Memoize components when needed
- Optimize re-renders
- Use keys for list items

---

## Testing

### Component Testing (Future)
```bash
npm install --save-dev @testing-library/react jest
npm test
```

### API Testing
Use Postman or similar tool to test endpoints:
```
GET http://localhost:3000/api/products
POST http://localhost:3000/api/products (with JSON body)
PUT http://localhost:3000/api/products/1
DELETE http://localhost:3000/api/products/1
```

---

## Debugging Tips

### 1. Browser DevTools
- Check Network tab for API calls
- Use Console for errors/logs
- Use React DevTools for component state

### 2. VS Code Debugging
Debug configuration in `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 3. Common Issues
- **Module not found**: Check import paths
- **CORS errors**: Configure CORS in API routes
- **State not updating**: Check component re-renderings
- **API 404**: Verify file paths in api/routes

---

## Environment Setup

### IDE Settings (VS Code)
Recommended extensions:
- Prettier - Code formatter
- ESLint - Linting
- Tailwind CSS IntelliSense
- Thunder Client - API testing

### Project Settings
- Node version: v16 or higher
- Package manager: npm or yarn
- IDE: VS Code recommended
- Browser: Chrome, Firefox, or Safari

---

## File Naming Conventions

### Pages
- Use lowercase folders: `products/`, `customers/`
- Use `page.tsx` for routes
- Use layout.tsx for layout files

### Components
- PascalCase file names: `ProductTable.tsx`
- Reusable in `components/common/`
- Feature-specific in `components/features/`

### Utilities
- lowercase file names: `api.ts`, `utils.ts`
- Related functions grouped in same file
- Clear export names

### API Routes
- Folder structure mirrors API paths
- `route.ts` for main handlers
- `[id]/route.ts` for dynamic routes

---

## Next Steps for Contributors

1. **Understand the current structure** - Explore existing code
2. **Read component code** - Learn patterns used
3. **Follow conventions** - Match existing code style
4. **Test changes** - Run locally before committing
5. **Write clean code** - Use consistent formatting
6. **Document changes** - Add comments for complex logic

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript

# Cleaning
npm cache clean --force
rm -rf .next node_modules
npm install
```

---

**Happy coding! 🚀**
