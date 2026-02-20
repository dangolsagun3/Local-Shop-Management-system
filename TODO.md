# TODO: Create user routes for backend

## Task: Create user.routes for backend and should login after the sign up is correct

### Files to Create:
- [] 1. server/models/User.js - Mongoose User model
- [ ] 2. server/routes/user.js - User routes (signup, login)
- [ ] 3. server/index.js - Main Express server entry point

### Implementation Details:
1. **server/models/User.js**
   - Create Mongoose schema for User
   - Fields: fullName, contact, email, password (hashed)
   - Add pre-save hook for password hashing

2. **server/routes/user.js**
   - POST /signup - Register user, hash password, return JWT token (auto-login)
   - POST /login - Verify credentials, return JWT token

3. **server/index.js**
   - Set up Express server
   - Connect to MongoDB
   - Use CORS for frontend communication
   - Mount user routes at /api/auth
   - Start server on port 5000

### Key Requirement:
- After successful signup, return JWT token so frontend can auto-login
