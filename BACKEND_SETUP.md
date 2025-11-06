# 🚀 ReLive Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier)

## Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - **Name**: relive-memory-journal
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### 2. Setup Database

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy contents of `database-schema.sql`
3. Paste into SQL Editor
4. Click **Run** to create all tables

### 3. Setup Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `memory-photos`
4. Set to **Public bucket** (or private if you prefer)
5. Click **Create bucket**

### 4. Get API Keys

1. In Supabase Dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (different long string)

### 5. Configure Environment Variables

1. Create `.env.local` file in project root:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 6. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 7. Test the Backend

```bash
npm run dev
```

Your backend is now running! Test the API endpoints:

## 📡 API Endpoints

### Memories

- `GET /api/memories?userId=xxx` - Get all memories for user
- `POST /api/memories` - Create new memory
- `GET /api/memories/[id]` - Get single memory
- `PUT /api/memories/[id]` - Update memory
- `DELETE /api/memories/[id]` - Delete memory

### Upload

- `POST /api/upload` - Upload photo/video

### Tags

- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag

### Stats

- `GET /api/stats?userId=xxx` - Get user statistics

## 🧪 Testing API with cURL

### Create a memory:

```bash
curl -X POST http://localhost:3000/api/memories \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-id-here",
    "title": "My First Memory",
    "content": "This is a beautiful memory!",
    "date": "2025-11-06",
    "mood": "Happy 😊"
  }'
```

### Upload a photo:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/photo.jpg" \
  -F "userId=user-id-here" \
  -F "memoryId=memory-id-here"
```

## 🔐 Authentication

You already have Better Auth configured! To integrate with the API:

1. Get user ID from Better Auth session
2. Pass it to API endpoints
3. Supabase RLS policies will secure the data

## 📦 File Structure

```
src/
├── app/
│   └── api/
│       ├── memories/
│       │   ├── route.ts          # GET, POST memories
│       │   └── [id]/route.ts     # GET, PUT, DELETE single memory
│       ├── upload/route.ts       # Upload photos/videos
│       ├── tags/route.ts         # Manage tags
│       └── stats/route.ts        # Get statistics
└── lib/
    └── supabase.ts               # Supabase client & helpers
```

## 🎯 Next Steps

1. ✅ Backend is ready!
2. Connect your forms (add-memory page) to API
3. Fetch and display memories in gallery/timeline
4. Test upload functionality
5. Add error handling and loading states

## 🐛 Troubleshooting

**Error: Cannot find module '@supabase/supabase-js'**

```bash
npm install @supabase/supabase-js --legacy-peer-deps
```

**Error: Invalid API key**

- Double-check `.env.local` file
- Make sure no extra spaces in keys
- Restart dev server after changing env vars

**Error: Table does not exist**

- Run `database-schema.sql` in Supabase SQL Editor
- Check table creation succeeded

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
