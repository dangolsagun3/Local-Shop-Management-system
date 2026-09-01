# Local Setup Guide

This guide helps you run the Local Shop Management System locally without dependency or connection issues.

## 1. Prerequisites

Install the following:

- Node.js 20.x or 22.x LTS
- npm
- Git
- MongoDB Atlas account, or a local MongoDB instance
- Optional: Postman and MongoDB Compass

Verify installation:

```bash
node -v
npm -v
git --version
```

## 2. Project structure

Use this structure:

```text
Local-Shop-Management-system/
  serverside/
  nextapp/
```

## 3. Backend setup

### 3.1 Open the backend folder

```bash
cd /path/to/Local-Shop-Management-system/serverside
```

### 3.2 Install backend dependencies

```bash
npm install
```

If you see missing-module errors such as `nodemailer`, `slugify`, or `tsx`, install them explicitly:

```bash
npm install nodemailer slugify tsx typescript nodemon @types/node @types/express @types/nodemailer
```

### 3.3 Create backend environment file

```bash
cp .env-sample .env
nano .env
```

### 3.4 Backend .env example

```env
PORT=5000
HOST=127.0.0.1

MONGODB_URL=mongodb://127.0.0.1:27017/local-shop
# Or Atlas:
# MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/local-shop?retryWrites=true&w=majority

DB_NAME=local-shop

JWT_SECRET=replace-this-with-a-long-random-string
JWT_REFRESH_SECRET=replace-this-with-another-long-random-string

IMAGE_BASE_PATH=http://localhost:5000/image

SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_ADDRESS=your_email@gmail.com
```

### 3.5 MongoDB setup

#### Option A: Local MongoDB

Start MongoDB locally:

```bash
sudo systemctl start mongod
```

Then use:

```env
MONGODB_URL=mongodb://127.0.0.1:27017/local-shop
```

#### Option B: MongoDB Atlas

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Go to Network Access and allow your IP.
4. Go to Database Access and create a database user.
5. Copy the connection string from Atlas and paste it into `MONGODB_URL`.

If your password contains special characters, URL-encode it.

```bash
node -e "console.log(encodeURIComponent('your-password'))"
```

### 3.6 Start the backend

```bash
npm run dev
```

Expected backend URL:

```text
http://127.0.0.1:5000
```

## 4. Frontend setup

### 4.1 Open the frontend folder

```bash
cd /path/to/Local-Shop-Management-system/nextapp
```

### 4.2 Install frontend dependencies

```bash
npm install
```

### 4.3 Create frontend environment file

```bash
nano .env.local
```

### 4.4 Frontend .env example

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4.5 Start the frontend

```bash
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

## 5. Troubleshooting checklist

### Module not found errors

If you see errors like `Cannot find module 'nodemailer'`, `slugify`, or `tsx`:

```bash
cd /path/to/Local-Shop-Management-system/serverside
npm install
npm install nodemailer slugify tsx
```

If installation is corrupted:

```bash
rm -rf node_modules package-lock.json
npm install
```

### MongoDB bad auth error

Check:

- You used the database user password, not your Atlas account password
- The user exists in Atlas Database Access
- The cluster and user belong to the same project
- The connection string is correct

### MongoDB connection timeout

Check:

- Your IP is whitelisted in Atlas Network Access
- You are not using a VPN that changes your IP
- The MongoDB URI is correct

For testing, you can temporarily allow access from `0.0.0.0/0`.

### CORS errors

If the frontend cannot reach the backend, update the backend CORS settings in [serverside/src/app.ts](serverside/src/app.ts) to allow the frontend origin:

```ts
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"]
}));
```

Then restart the backend.

## 6. Quick start summary

Run both apps in separate terminals:

```bash
cd /path/to/Local-Shop-Management-system/serverside
npm install
npm run dev
```

```bash
cd /path/to/Local-Shop-Management-system/nextapp
npm install
npm run dev
```
