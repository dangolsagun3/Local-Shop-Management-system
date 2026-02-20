# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. Port 3000 Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Option 1: Kill process on port 3000
npx kill-port 3000

# Option 2: Use different port
PORT=3001 npm run dev

# Option 3: Find and kill manually
lsof -i :3000
kill -9 <PID>
```

---

### 2. Dependencies Not Installing

**Problem:** `npm ERR! npm WARN ...`

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, use older npm version
npm install -g npm@8
```

---

### 3. Next.js Build Errors

**Problem:** `Error: Failed to compile` or TypeScript errors

**Solutions:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild project
npm run build

# Check for type errors specifically
npm run type-check

# If TypeScript strict mode causes issues, temporarily disable in tsconfig.json
```

---

### 4. Module Not Found Error

**Problem:** `Module not found: Can't resolve '@/components/...`

**Solutions:**
- Check file path is correct (case-sensitive)
- Verify file exists in `components/` folder
- Check `tsconfig.json` has correct path alias
- Clear `.next` folder and rebuild

---

### 5. API Routes Not Working

**Problem:** `404 Not Found` when calling API endpoints

**Solutions:**
```bash
# Verify file structure
# File should be at: localshop/app/api/products/route.ts

# Check route.ts exports functions
# Must export: GET, POST, PUT, DELETE

# Verify fetch URL matches route path
// Correct: /api/products
// Wrong: /api/product

# Clear Next.js cache and restart
rm -rf .next
npm run dev
```

---

### 6. Data Not Persisting

**Problem:** Data disappears when server restarts

**This is normal!** The application uses in-memory mock data.

**Solution:** To persist data:
1. Connect MongoDB (see DEVELOPER_GUIDE.md)
2. Replace mock API routes with database queries
3. Use Mongoose for data modeling

---

### 7. CSS Not Loading

**Problem:** Tailwind CSS classes not showing styles

**Solutions:**
```bash
# Verify tailwind.config.js has correct content paths
# Check tsconfig.json is valid

# Clear Tailwind cache
rm -rf node_modules/.cache

# Rebuild
npm run build
npm run dev

# Check browser DevTools for CSS loading
# Open Developer Tools > Network > find CSS files
```

---

### 8. TypeScript Errors in IDE

**Problem:** Red squiggly lines even though code works

**Solutions:**
- Restart TypeScript server in VS Code
  - Ctrl+Shift+P → "TypeScript: Restart TS Server"
- Check tsconfig.json is in localshop folder
- Install type definitions:
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

---

### 9. Form Submissions Not Working

**Problem:** Form submit button doesn't work

**Solutions:**
- Check `handleSubmit` function exists
- Verify form has `onSubmit={handleSubmit}`
- Check API endpoint URL is correct
- Check browser console for errors
- Verify all required fields are filled

---

### 10. Modal Doesn't Appear

**Problem:** Modal component doesn't show

**Solutions:**
- Check `isModalOpen` state is true
- Verify modal is imported correctly
- Check z-index in CSS (should be z-50)
- Verify background overlay shows (z-50 layer)
- Check onClick handlers set state correctly

---

### 11. Search Not Filtering

**Problem:** Search filter doesn't reduce table rows

**Solutions:**
- Check `searchTerm` state is updating
- Verify filter logic is correct:
```tsx
const filtered = items.filter(item => 
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
)
```
- Ensure `searchTerm` is compared correctly
- Check if data has the field being searched

---

### 12. Sidebar Not Responsive

**Problem:** Sidebar doesn't collapse on mobile

**Solutions:**
- Check window width is detected correctly
- Verify `isOpen` state is managed
- Check CSS classes have `max-w-` breakpoints
- Use browser DevTools to test responsive mode

---

### 13. Table Overflow on Mobile

**Problem:** Table content overlaps on small screens

**Solutions:**
```tsx
// Add horizontal scroll
<div className="overflow-x-auto">
  <table>...</table>
</div>

// Or use responsive classes
<div className="w-full overflow-hidden">
  <table className="min-w-full">...</table>
</div>
```

---

### 14. Images Not Loading

**Problem:** Images show broken icon

**Solutions:**
- Verify images are in `public/` folder
- Use correct path: `/image-name.jpg`
- Check image file exists and is accessible
- Use relative path from public folder

---

### 15. Console Errors

**Common Console Errors & Fixes:**

**Error:** `Expected server HTML to contain a matching <div>`
- Fix: Clear browser cache, restart dev server

**Error:** `hydration failed`
- Fix: Clear `.next` folder, restart server

**Error:** `useLayoutEffect does nothing on the server`
- Fix: Use `useEffect` instead of `useLayoutEffect`

**Error:** `window is not defined`
- Fix: Add `'use client'` at top of component

---

## Performance Issues

### 1. Slow Page Load

**Problem:** Pages take too long to load

**Solutions:**
```bash
# Analyze bundle size
npm run build

# Check which components are heavy
# Use Next.js profiling

# Optimize images
# Use next/image component

# Lazy load components
import dynamic from 'next/dynamic'
const Component = dynamic(() => import('./Component'), {
  loading: () => <p>Loading...</p>
})
```

### 2. Slow Pagination

**Problem:** Data loads slowly with large tables

**Solutions:**
- Implement pagination (currently shows all)
- Add virtual scrolling for long lists
- Filter data before display
- Use debouncing for search

---

## Development Tips

### Debug Print Statements
```tsx
console.log('Value:', variable)
console.error('Error:', error)
console.table(arrayOfObjects)
console.log('%cStyled Log', 'color: blue; font-size: 16px;')
```

### Browser DevTools
- **Elements:** Check HTML structure
- **Console:** View JavaScript errors
- **Network:** Monitor API calls
- **Application:** Check localStorage
- **Performance:** Check page load time

### VS Code Debugging
See DEVELOPER_GUIDE.md for debug configuration

---

## Getting Help

### Check These First
1. Read error message carefully
2. Check browser console
3. Check VS Code problems panel
4. Search error in documentation
5. Check if similar issue in existing code

### Where to Look
- **Installation issues:** SETUP.md
- **Feature issues:** QUICK_START.md
- **Code issues:** DEVELOPER_GUIDE.md
- **API issues:** Check /app/api/ routes
- **Component issues:** Check /components/ folder

---

## Reset Everything

If all else fails, start fresh:

```bash
# Go to localshop folder
cd localshop

# Remove everything
rm -rf node_modules package-lock.json .next

# Reinstall and run
npm install
npm run dev
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Next.js | ✅ | ✅ | ✅ | ✅ |
| React 19 | ✅ | ✅ | ✅ | ✅ |
| Tailwind CSS | ✅ | ✅ | ✅ | ✅ |
| Forms | ✅ | ✅ | ✅ | ✅ |
| Modal | ✅ | ✅ | ✅ | ✅ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ |

---

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 16.x | 18.x+ |
| npm | 8.0 | 9.0+ |
| RAM | 2GB | 4GB+ |
| Disk Space | 500MB | 1GB+ |
| OS | Any | Windows/Mac/Linux |

---

## Known Limitations

1. **Data Persistence:** Data resets on server restart (use MongoDB to fix)
2. **Authentication:** Currently accepts any credentials (add JWT to fix)
3. **Validation:** Minimal server-side validation (add validation middleware)
4. **Pagination:** All data loaded at once (implement pagination)
5. **File Upload:** Not implemented (ready to add)

---

## Report Issues

If you find a bug:
1. Note the steps to reproduce
2. Check if it's in this troubleshooting guide
3. Check browser console for errors
4. Try the solutions provided
5. Document the issue for reference

---

## Success Indicators

✅ You're good if:
- `npm run dev` starts without errors
- http://localhost:3000 loads in browser
- Login page appears
- Can navigate between pages
- Can add/edit/delete items
- Tables populate with data
- Forms accept input

---

**Still having issues? Check the documentation files or try the solutions above!** 🚀

Last Updated: February 12, 2026
