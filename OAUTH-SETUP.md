# OAuth Authentication Setup Guide

## Overview

Your ReLive app now supports OAuth authentication with **Google** and **GitHub**. Users can sign in/sign up using their existing accounts from these providers.

## ✅ What's Been Implemented

### 1. **Login Page** (`/auth/login`)

- Google OAuth button with branded logo
- GitHub OAuth button
- Loading states for each provider
- Error handling

### 2. **Signup Page** (`/auth/signup`)

- Same OAuth buttons as login
- Seamless account creation flow
- Automatic redirect to dashboard

### 3. **OAuth Callback Route** (`/auth/callback`)

- Handles OAuth redirect after user authenticates
- Exchanges authorization code for session
- Sets secure cookies
- Redirects to dashboard

## 🔧 Supabase Configuration Required

To enable OAuth, you need to configure providers in your Supabase dashboard:

### Step 1: Access Authentication Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**

---

### Step 2: Configure Google OAuth

#### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - App name: `ReLive Digital Memory Journal`
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `ReLive OAuth`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://your-production-domain.com
     ```
   - Authorized redirect URIs:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
7. Copy **Client ID** and **Client Secret**

#### 2.2 Configure in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and toggle it **Enabled**
3. Paste your **Client ID**
4. Paste your **Client Secret**
5. Click **Save**

---

### Step 3: Configure GitHub OAuth

#### 3.1 Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in details:
   - Application name: `ReLive Digital Memory Journal`
   - Homepage URL: `http://localhost:3000` (or your production URL)
   - Application description: `A digital memory journal app`
   - Authorization callback URL:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
4. Click **Register application**
5. Copy **Client ID**
6. Click **Generate a new client secret** and copy it

#### 3.2 Configure in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **GitHub** and toggle it **Enabled**
3. Paste your **Client ID**
4. Paste your **Client Secret**
5. Click **Save**

---

### Step 4: Configure Redirect URLs (Important!)

In Supabase Dashboard → **Authentication** → **URL Configuration**:

Add these redirect URLs:

```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

---

## 🧪 Testing OAuth Flow

### Local Development

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/login`
3. Click **Google** or **GitHub** button
4. You'll be redirected to provider's login page
5. Authorize the app
6. You'll be redirected back to `/auth/callback`
7. Finally redirected to `/dashboard`

### What Happens Behind the Scenes

1. User clicks OAuth button
2. App redirects to provider (Google/GitHub)
3. User logs in and authorizes app
4. Provider redirects to `/auth/callback?code=...`
5. Callback route exchanges code for session
6. Session cookie is set
7. User is redirected to dashboard

---

## 📊 User Data Storage

When a user signs in with OAuth:

- **Email**: Automatically retrieved from provider
- **Name**: Retrieved from provider profile
- **Avatar**: Provider profile picture URL stored
- **User ID**: Supabase generates unique ID
- **Provider**: Stored (google/github)

### Database Schema

The `users` table will have:

- `id`: UUID (primary key)
- `email`: User's email from OAuth provider
- `full_name`: Name from OAuth profile
- `avatar_url`: Profile picture URL
- `created_at`: Account creation timestamp

---

## 🔒 Security Features

✅ **PKCE Flow**: Uses Proof Key for Code Exchange for enhanced security
✅ **Secure Cookies**: HttpOnly cookies prevent XSS attacks
✅ **State Parameter**: Prevents CSRF attacks
✅ **Token Refresh**: Automatic session refresh
✅ **Scopes**: Minimal permissions requested (email, profile)

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid redirect URL"

**Solution**: Make sure redirect URLs are added in:

- Supabase → Authentication → URL Configuration
- Google Cloud Console → Credentials → Authorized redirect URIs
- GitHub OAuth App → Authorization callback URL

### Issue 2: "Client ID or Secret incorrect"

**Solution**:

- Verify you copied the correct credentials
- Check for extra spaces/newlines when pasting
- Regenerate credentials if needed

### Issue 3: OAuth button doesn't work

**Solution**:

- Check browser console for errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Ensure providers are **Enabled** in Supabase dashboard

### Issue 4: "Error exchanging code for session"

**Solution**:

- Check that callback route exists at `/app/auth/callback/route.ts`
- Verify the route is properly handling the code exchange
- Check Supabase logs for detailed error messages

### Issue 5: User redirected but not logged in

**Solution**:

- Check cookie settings in callback route
- Verify middleware is refreshing sessions
- Check browser's cookie storage (DevTools → Application → Cookies)

---

## 🎨 UI Features

### Google Button

- Official Google brand colors
- Multi-color logo SVG
- White background with gray border
- Loading spinner when processing

### GitHub Button

- GitHub dark theme (#1B1F23)
- GitHub icon from Lucide
- White text on dark background
- Loading spinner when processing

### States

- **Normal**: Fully interactive
- **Loading**: Spinner shows, button disabled
- **Disabled**: When other auth action in progress
- **Error**: Red error message displays below buttons

---

## 📝 Environment Variables

Make sure these are in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 Production Deployment

Before deploying:

1. ✅ Add production domain to Google OAuth authorized origins
2. ✅ Add production domain to GitHub OAuth callback URL
3. ✅ Add production callback URL to Supabase URL configuration
4. ✅ Test OAuth flow on production URL
5. ✅ Monitor Supabase logs for any errors

---

## 📞 Support

If you encounter issues:

1. Check Supabase Dashboard → **Logs** → **Auth Logs**
2. Check browser console for client-side errors
3. Verify all URLs match exactly (no trailing slashes)
4. Test with a different browser/incognito mode
5. Check provider-specific documentation:
   - [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
   - [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)

---

## ✨ Next Steps (Optional Enhancements)

- Add more OAuth providers (Facebook, Twitter, Microsoft)
- Display provider avatar in UserMenu
- Allow users to link multiple OAuth accounts
- Add "Continue with Apple" for iOS users
- Implement OAuth token refresh handling
- Add OAuth account unlinking feature

---

**✅ OAuth authentication is now ready to use!**

Test it locally first, then configure your production credentials before deploying.
