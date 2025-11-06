# Better Auth Setup Guide for ReLive

## ✅ What's Been Created

### 1. Authentication Pages

- ✅ `/auth/login` - Login page with email/password
- ✅ `/auth/signup` - Sign up page with name, email, password
- ✅ Beautiful notebook-style design matching your app theme

### 2. Auth Configuration Files

- ✅ `src/lib/auth.ts` - Server-side Better Auth configuration
- ✅ `src/lib/auth-client.ts` - Client-side auth hooks
- ✅ `src/app/api/auth/[...all]/route.ts` - Auth API endpoint handler

### 3. Components

- ✅ `ProtectedRoute` - Wrapper for protected pages
- ✅ `UserMenu` - User dropdown menu with avatar
- ✅ Session management with React hooks

### 4. Database Schema

- ✅ `better-auth-schema.sql` - Better Auth tables (user, session, account, verification)

---

## 🔧 Setup Steps

### Step 1: Get Your Supabase Database Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vghxjycaezcgmatximnn)
2. Click **"Settings"** in the left sidebar
3. Click **"Database"**
4. Scroll down to **"Connection string"**
5. Click **"URI"** tab
6. Copy the connection string (it will look like):
   ```
   postgresql://postgres.vghxjycaezcgmatximnn:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password
   - If you forgot it, you can reset it in **Settings → Database → Reset database password**

### Step 2: Update .env.local File

Open `.env.local` and replace the `DATABASE_URL` line with your actual connection string:

```bash
DATABASE_URL=postgresql://postgres.vghxjycaezcgmatximnn:YOUR_ACTUAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**Important:** Replace `YOUR_ACTUAL_PASSWORD` with your real database password!

### Step 3: Run Database Schemas

**A. First, run the main schema (if not done yet):**

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/vghxjycaezcgmatximnn/sql/new)
2. Open `database-schema.sql` from your project
3. Copy ALL contents and paste into SQL Editor
4. Click **"Run"**
5. You should see: "Success. No rows returned"

**B. Then, run the Better Auth schema:**

1. Still in [Supabase SQL Editor](https://supabase.com/dashboard/project/vghxjycaezcgmatximnn/sql/new)
2. Open `better-auth-schema.sql` from your project
3. Copy ALL contents and paste into SQL Editor
4. Click **"Run"**
5. You should see: "Success. No rows returned"

### Step 4: Create Storage Bucket (if not done yet)

1. Go to [Supabase Storage](https://supabase.com/dashboard/project/vghxjycaezcgmatximnn/storage/buckets)
2. Click **"Create a new bucket"**
3. Name: `memory-photos`
4. Make it **Public** ✅
5. Click **"Create bucket"**

### Step 5: Install Dependencies (Already Done ✅)

The following packages have been installed:

- ✅ `better-auth`
- ✅ `drizzle-orm`
- ✅ `postgres`

### Step 6: Restart Your Dev Server

Close your current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

---

## 🧪 Testing Authentication

### Test Sign Up:

1. Go to: http://localhost:3000/auth/signup
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
3. Click **"Create Account"**
4. You should be redirected to `/dashboard`

### Test Login:

1. Go to: http://localhost:3000/auth/login
2. Use the credentials from above
3. Click **"Sign In"**
4. You should be redirected to `/dashboard`

---

## 📝 Next Steps After Auth Setup

Once authentication is working, we'll:

1. ✅ Add `ProtectedRoute` wrapper to protected pages (dashboard, add-memory, gallery, timeline)
2. ✅ Add `UserMenu` to navigation headers
3. ✅ Update API routes to use authenticated user ID
4. ✅ Connect frontend forms to backend APIs
5. ✅ Fetch real data from Supabase instead of mock data

---

## 🐛 Troubleshooting

### Error: "Database connection failed"

- ✅ Check that DATABASE_URL in `.env.local` has the correct password
- ✅ Make sure you're using the **connection pooler** URL (port 6543)
- ✅ Verify your Supabase project is active

### Error: "Table does not exist"

- ✅ Make sure you ran BOTH SQL schema files in Supabase
- ✅ Check that tables were created in Supabase Table Editor

### Error: "Module not found"

- ✅ Restart your dev server after installing packages
- ✅ Delete `.next` folder and restart: `rm -rf .next; npm run dev`

### Can't access login page

- ✅ Make sure dev server is running
- ✅ Try accessing: http://localhost:3000/auth/login directly

---

## 🎯 Quick Checklist

Before continuing to frontend integration:

- [ ] Got Supabase database password
- [ ] Updated DATABASE_URL in .env.local
- [ ] Ran database-schema.sql in Supabase
- [ ] Ran better-auth-schema.sql in Supabase
- [ ] Created memory-photos storage bucket
- [ ] Restarted dev server
- [ ] Successfully signed up a test user
- [ ] Successfully logged in with test user

---

## 🚀 Ready?

Once you've completed all the steps above and can successfully sign up/login, let me know and we'll proceed with:

1. Protecting your routes
2. Adding user menu to navigation
3. Integrating frontend with backend APIs
4. Making your app fully functional!

---

**Note:** The auth system uses JWT tokens stored in HTTP-only cookies for security. Sessions last 7 days and auto-refresh on activity.
