# 📖 ReLive - Digital Memory Journal

A beautiful, vintage-inspired digital memory journal built with Next.js, allowing you to capture and relive your precious moments with photos, audio, and stories.

## ✨ Features

- **Memory Timeline** - View your memories in a chronological, vintage postcard-style timeline
- **Gallery View** - Browse your memories in a Polaroid-style photo gallery
- **Rich Media Support** - Upload photos, audio recordings, and write detailed stories
- **Mood Tracking** - Track your emotional journey with mood indicators and visualizations
- **On This Day** - Automatically shows memories from past years, months, or recent days
- **Tags & Locations** - Organize memories with tags and location data
- **Secure Authentication** - User authentication powered by Supabase
- **Cloud Storage** - Media optimized and stored via Cloudinary
- **Responsive Design** - Beautiful handwritten fonts and vintage notebook aesthetic

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Media Storage:** Cloudinary
- **UI Components:** Shadcn/ui
- **Icons:** Lucide React

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Cloudinary account

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/saran2006psg/relive-digital-memory-journal.git
cd relive-digital-memory-journal
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

4. Set up the database:
   - Run the SQL scripts in the following order:
     - `database-schema.sql`
     - `supabase-rls-policies.sql`
     - `supabase-storage-policies.sql`

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── gallery/      # Gallery view
│   │   ├── timeline/     # Timeline view
│   │   └── add-memory/   # Add memory page
│   ├── components/       # React components
│   │   └── ui/          # UI components (shadcn)
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and configurations
├── public/              # Static assets
└── SQL files            # Database setup scripts
```

## 🎨 Design Features

- **Vintage Aesthetic** - Handwritten fonts (Dancing Script, Architects Daughter)
- **Notebook Style** - Ruled lines, margin decorations, and tape effects
- **Mood Colors** - Color-coded mood indicators throughout the app
- **Responsive Grid** - Adapts to different screen sizes beautifully

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- User-specific data isolation
- Secure file upload with Cloudinary
- Environment variables for sensitive data

## 📝 Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset

## 🚢 Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Saran**

- GitHub: [@saran2006psg](https://github.com/saran2006psg)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend infrastructure
- Cloudinary for media management
- Shadcn for beautiful UI components

---

Made with ❤️ and vintage vibes
