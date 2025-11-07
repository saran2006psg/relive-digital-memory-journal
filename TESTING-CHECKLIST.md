# 🧪 ReLive - Pre-Deployment Testing Checklist

**Project:** ReLive Digital Memory Journal  
**Testing Date:** November 7, 2025  
**Environment:** Development (localhost:3000)  
**Tester:** ****\_\_\_****

---

## 📋 **Testing Instructions**

1. Start the development server: `npm run dev`
2. Test each section systematically
3. Mark ✅ for PASS, ❌ for FAIL, ⚠️ for ISSUE
4. Document any bugs or issues in the **Issues Found** section
5. All critical tests must PASS before deployment

---

## 1️⃣ **AUTHENTICATION FLOW** 🔐

### Signup

- [ ] Navigate to `/auth/signup`
- [ ] Create new account with valid email/password
- [ ] Verify account is created in Supabase
- [ ] Check automatic redirect to dashboard after signup
- [ ] **Test invalid inputs:**
  - [ ] Empty fields
  - [ ] Invalid email format
  - [ ] Weak password
  - [ ] Already existing email

### Login

- [ ] Navigate to `/auth/login`
- [ ] Login with correct credentials
- [ ] Verify redirect to dashboard
- [ ] Check user session persists after page refresh
- [ ] **Test invalid inputs:**
  - [ ] Wrong password
  - [ ] Non-existent email
  - [ ] Empty fields

### Logout

- [ ] Click user menu
- [ ] Click logout
- [ ] Verify redirect to login page
- [ ] Confirm session is cleared
- [ ] Try accessing protected routes (should redirect to login)

### Protected Routes

- [ ] Without login, try accessing `/dashboard` → redirects to login
- [ ] Without login, try accessing `/add-memory` → redirects to login
- [ ] Without login, try accessing `/gallery` → redirects to login
- [ ] Without login, try accessing `/timeline` → redirects to login

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 2️⃣ **ADD MEMORY FUNCTIONALITY** ➕

### Basic Memory Creation

- [ ] Navigate to `/add-memory`
- [ ] Fill in all fields:
  - [ ] Title
  - [ ] Content/Story
  - [ ] Date
  - [ ] Location
  - [ ] Select mood emoji
- [ ] Click "Save Memory"
- [ ] Verify loading animation shows all steps:
  - [ ] "Verifying session..."
  - [ ] "Creating memory in database..."
  - [ ] "Memory created ✓"
  - [ ] "Finalizing..."
  - [ ] "Memory saved successfully! ✓"
- [ ] Check progress percentage increases (0% → 100%)
- [ ] Verify redirect to gallery after save

### Image Upload

- [ ] Upload single image
- [ ] Upload multiple images (3-5)
- [ ] Test different formats: JPG, PNG, WebP
- [ ] Upload large image (>5MB)
- [ ] Verify loading shows: "Uploading media files (X/Y)..."
- [ ] Check images appear in gallery

### Audio Upload

- [ ] Record audio or upload audio file
- [ ] Verify loading shows: "Uploading audio recording..."
- [ ] Check audio appears in memory

### Tags

- [ ] Add multiple tags
- [ ] Test tag autocomplete (if implemented)
- [ ] Verify tags save correctly

### Validation

- [ ] Try saving without title → error message
- [ ] Try saving without content → error message
- [ ] Try saving without date → error message
- [ ] Verify required fields are marked

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 3️⃣ **GALLERY VIEW** 🖼️

### Display & Layout

- [ ] Navigate to `/gallery`
- [ ] Verify all memories display in Polaroid cards
- [ ] Check images load with proper thumbnails
- [ ] Verify mood badge shows on each card
- [ ] Check tape effect styling
- [ ] Count matches database entries

### Pagination

- [ ] If more than 9 memories, verify pagination appears
- [ ] Click "Next" button
- [ ] Click "Previous" button
- [ ] Click page numbers
- [ ] Verify correct memories show on each page

### Modal Interaction

- [ ] Click any memory card
- [ ] Verify full-screen modal opens
- [ ] Check all details display:
  - [ ] Title
  - [ ] Date
  - [ ] Location (if present)
  - [ ] Mood emoji
  - [ ] Full story/content
  - [ ] All images (carousel if multiple)
  - [ ] Audio player (if present)
  - [ ] Tags
- [ ] Test image carousel navigation (if multiple images)
- [ ] Click X button to close modal
- [ ] Test clicking outside modal (should close)

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 4️⃣ **EDIT MEMORY FEATURE** ✏️

### Edit Flow

- [ ] Open memory in gallery modal
- [ ] Click blue edit button
- [ ] Verify edit form appears with pre-filled data:
  - [ ] Title
  - [ ] Content
  - [ ] Date
  - [ ] Location
  - [ ] Mood (selected)
- [ ] Modify title
- [ ] Modify content
- [ ] Change date
- [ ] Change location
- [ ] Select different mood
- [ ] Click "Save Changes"
- [ ] Verify loading state shows
- [ ] Check updates reflect immediately in UI
- [ ] Close and reopen memory to verify changes persisted

### Cancel Edit

- [ ] Click edit button
- [ ] Modify some fields
- [ ] Click "Cancel"
- [ ] Verify changes are discarded
- [ ] Check original data still displayed

### Validation

- [ ] Clear title field → Save button disabled
- [ ] Clear content field → Save button disabled

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 5️⃣ **DELETE MEMORY FEATURE** 🗑️

### Delete Flow

- [ ] Open memory in gallery modal
- [ ] Click red trash button
- [ ] Verify confirmation dialog appears
- [ ] Read warning message
- [ ] Click "Cancel" → modal closes, memory remains
- [ ] Click trash button again
- [ ] Click "Delete" → loading state shows
- [ ] Verify memory disappears from gallery
- [ ] Check Supabase: memory deleted from database
- [ ] Check Supabase: associated media records deleted
- [ ] Verify pagination adjusts if on last page

### Error Handling

- [ ] Try deleting while offline (if possible)
- [ ] Verify error message displays

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 6️⃣ **DASHBOARD FEATURES** 🏠

### Greeting Section

- [ ] Navigate to `/dashboard`
- [ ] Verify greeting shows:
  - [ ] Correct time-based greeting (Morning/Afternoon/Evening)
  - [ ] User's name (from account or email)
- [ ] Check vintage notebook styling

### On This Day

- [ ] Verify section shows memories with priority:
  1. [ ] Memories from same date, past year (if available)
  2. [ ] Memories from same date, past month (if #1 not found)
  3. [ ] Yesterday's memories (if #2 not found)
  4. [ ] Latest memory (if #3 not found)
- [ ] Check context text shows ("A year ago today", etc.)
- [ ] Verify memory card displays:
  - [ ] Date
  - [ ] Title
  - [ ] Story (truncated at 150 chars with "...")
  - [ ] Image (if available)
- [ ] Click memory card → redirects to timeline
- [ ] Verify timeline opens with that memory

### Mood Journey

- [ ] Check "This Month" button is active
- [ ] Verify mood chart shows current month's moods
- [ ] Check mood counts are correct
- [ ] Click "This Year" button
- [ ] Verify chart updates to show year's data
- [ ] Check donut chart displays properly
- [ ] Hover over chart segments (if interactive)

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 7️⃣ **NAVIGATION & ROUTING** 🧭

### Header Navigation

- [ ] Click "ReLive" logo → goes to dashboard
- [ ] Click "Dashboard" link → goes to dashboard
- [ ] Click "Add Memory" link → goes to add memory page
- [ ] Click "Timeline" link → goes to timeline
- [ ] Click "Gallery" link → goes to gallery
- [ ] Click user menu → dropdown appears
- [ ] Click "Logout" → logs out

### "On This Day" Navigation

- [ ] From dashboard, click "On This Day" memory
- [ ] Verify URL includes `?highlight=memory-id`
- [ ] Check timeline page loads
- [ ] Verify memory modal opens automatically
- [ ] Check page scrolls to memory card
- [ ] Verify pulse animation on card

### Browser Navigation

- [ ] Click browser back button → goes to previous page
- [ ] Click browser forward button → goes forward
- [ ] Test deep linking: paste `/gallery` URL → works
- [ ] Test protected route without auth → redirects to login

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 8️⃣ **TIMELINE VIEW** 📅

### Display & Grouping

- [ ] Navigate to `/timeline`
- [ ] Verify memories grouped by year (newest first)
- [ ] Check memories grouped by month within year
- [ ] Verify timeline line appears (dashed vertical line)
- [ ] Check "Journey Begins Here" indicator at top

### Memory Cards

- [ ] Verify cards display in postcard style
- [ ] Check alternating left/right layout
- [ ] Verify each card shows:
  - [ ] Image (Polaroid style)
  - [ ] Title
  - [ ] Date badge
  - [ ] Content preview
  - [ ] Location (if present)
  - [ ] Tags (max 3)
  - [ ] Mood emoji badge
  - [ ] Audio icon (if audio present)
- [ ] Check hover effects work

### Filtering

- [ ] Click year badge → collapses/expands year
- [ ] Click month badge → filters to that month
- [ ] Click again → clears filter
- [ ] Verify filters work correctly

### Modal

- [ ] Click any memory card
- [ ] Verify full details modal opens
- [ ] Check all content displays correctly
- [ ] Close modal

### Pagination

- [ ] If more than 10 memories, verify pagination
- [ ] Test pagination controls

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 9️⃣ **MEDIA HANDLING** 📸

### Image Upload

- [ ] Upload JPG image → works
- [ ] Upload PNG image → works
- [ ] Upload WebP image → works
- [ ] Upload GIF image → works
- [ ] Upload large image (>5MB) → optimizes
- [ ] Upload very large image (>10MB) → handles gracefully

### Image Display

- [ ] Check Cloudinary URLs are generated
- [ ] Verify images are optimized (check Network tab)
- [ ] Test thumbnail generation
- [ ] Check responsive image loading
- [ ] Verify lazy loading (scroll down in gallery)

### Audio Upload

- [ ] Upload audio file (.mp3, .wav, .m4a)
- [ ] Verify audio player appears
- [ ] Test play/pause
- [ ] Test audio in gallery modal
- [ ] Test audio in timeline modal

### Error Handling

- [ ] Try uploading invalid file type → error message
- [ ] Try uploading corrupted file → error message
- [ ] Test upload with slow connection (throttle network)

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 🔟 **RESPONSIVE DESIGN** 📱

### Mobile (375px)

- [ ] Open DevTools, set viewport to 375px width
- [ ] Test all pages:
  - [ ] Dashboard → layout responsive
  - [ ] Add Memory → form usable
  - [ ] Gallery → cards stack properly
  - [ ] Timeline → readable and scrollable
- [ ] Test navigation menu → hamburger or responsive
- [ ] Test modals → full screen on mobile
- [ ] Test touch interactions

### Tablet (768px)

- [ ] Set viewport to 768px width
- [ ] Test all pages
- [ ] Verify 2-column layouts work
- [ ] Test touch interactions

### Desktop (1920px)

- [ ] Set viewport to 1920px width
- [ ] Verify content doesn't stretch too wide
- [ ] Check max-width constraints
- [ ] Test all hover effects

### Breakpoint Testing

- [ ] Slowly resize browser from 375px to 1920px
- [ ] Check no UI breaks at any point
- [ ] Verify smooth transitions

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 1️⃣1️⃣ **ERROR HANDLING** ⚠️

### Network Errors

- [ ] Disconnect internet
- [ ] Try loading gallery → error message
- [ ] Try creating memory → error message
- [ ] Reconnect internet
- [ ] Verify app recovers

### Form Validation

- [ ] Try submitting empty forms → validation messages
- [ ] Try invalid date → error
- [ ] Try SQL injection in title → sanitized

### File Upload Errors

- [ ] Upload file over size limit → error message
- [ ] Upload invalid file type → error message
- [ ] Cancel upload mid-way → handles gracefully

### API Errors

- [ ] Test with invalid auth token (modify in browser)
- [ ] Verify graceful error handling
- [ ] Check console for errors

### 404 Pages

- [ ] Navigate to `/nonexistent-page`
- [ ] Verify 404 page appears or redirects

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 1️⃣2️⃣ **PERFORMANCE & LOADING STATES** ⚡

### Loading Indicators

- [ ] Check loading spinner on dashboard (first load)
- [ ] Check loading spinner in gallery
- [ ] Check loading spinner in timeline
- [ ] Verify "Saving memory" loading animation
- [ ] Check skeleton loaders (if implemented)

### Page Load Performance

- [ ] Open Network tab in DevTools
- [ ] Load gallery page
- [ ] Check total load time (should be < 3 seconds)
- [ ] Verify images lazy load (not all at once)
- [ ] Check bundle size (should be reasonable)

### With Many Memories

- [ ] Create 20+ memories (or use test data)
- [ ] Load gallery → check performance
- [ ] Load timeline → check performance
- [ ] Verify pagination works well
- [ ] Check no lag when scrolling

### Caching

- [ ] Load a page
- [ ] Navigate away
- [ ] Come back → should load faster (cached)

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 1️⃣3️⃣ **DATABASE OPERATIONS** 💾

### Data Integrity

- [ ] Create memory → check Supabase `memories` table
- [ ] Upload images → check `media` table
- [ ] Edit memory → verify updates in database
- [ ] Delete memory → verify removed from database
- [ ] Check foreign key relationships maintained

### RLS (Row Level Security)

- [ ] Create second user account
- [ ] Login as User 1 → create memories
- [ ] Login as User 2 → verify User 1's memories NOT visible
- [ ] Check User 2 can only see their own data

### Concurrent Operations

- [ ] Open app in two browser tabs
- [ ] Edit same memory in both tabs
- [ ] Verify last save wins or conflict handled

### Data Persistence

- [ ] Create memory
- [ ] Logout
- [ ] Login again
- [ ] Verify memory still exists

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 1️⃣4️⃣ **PRODUCTION BUILD TEST** 🏗️

### Local Production Build

```bash
# Run these commands:
npm run build
npm run start
```

- [ ] Build completes without errors
- [ ] Build completes without warnings (or acceptable warnings)
- [ ] Check build output size (reasonable)
- [ ] Navigate to `http://localhost:3000`
- [ ] Test all critical features:
  - [ ] Login
  - [ ] Create memory
  - [ ] View gallery
  - [ ] View timeline
  - [ ] Edit memory
  - [ ] Delete memory
- [ ] Open DevTools Console → no errors
- [ ] Check Network tab → no failed requests
- [ ] Verify no `console.log` statements in production

### Build Analysis

- [ ] Check `.next/` folder created
- [ ] Verify static pages generated (if any)
- [ ] Check bundle size is reasonable

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 1️⃣5️⃣ **SECURITY & ENVIRONMENT CHECK** 🔒

### Environment Variables

- [ ] Verify `.env.local` exists
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Check all required env vars are set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `BETTER_AUTH_SECRET`
  - [ ] `BETTER_AUTH_URL`
  - [ ] `DATABASE_URL`
  - [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`

### Security Checks

- [ ] Verify no API keys in client-side code
- [ ] Check no sensitive data in console logs
- [ ] Verify authentication required for all protected routes
- [ ] Test SQL injection protection (try in form fields)
- [ ] Verify XSS protection (try `<script>alert('xss')</script>` in content)

### Git Check

- [ ] Run `git status`
- [ ] Verify `.env.local` NOT staged
- [ ] Verify no sensitive files tracked
- [ ] Check `.gitignore` includes:
  - [ ] `.env.local`
  - [ ] `.env*.local`
  - [ ] `node_modules/`
  - [ ] `.next/`

**Status:** [ ] PASS / [ ] FAIL  
**Notes:** ********************\_\_\_********************

---

## 📊 **TESTING SUMMARY**

| Test Category     | Status | Critical Issues |
| ----------------- | ------ | --------------- |
| Authentication    | [ ]    |                 |
| Add Memory        | [ ]    |                 |
| Gallery View      | [ ]    |                 |
| Edit Memory       | [ ]    |                 |
| Delete Memory     | [ ]    |                 |
| Dashboard         | [ ]    |                 |
| Navigation        | [ ]    |                 |
| Timeline          | [ ]    |                 |
| Media Handling    | [ ]    |                 |
| Responsive Design | [ ]    |                 |
| Error Handling    | [ ]    |                 |
| Performance       | [ ]    |                 |
| Database          | [ ]    |                 |
| Production Build  | [ ]    |                 |
| Security          | [ ]    |                 |

**Overall Status:** [ ] READY FOR DEPLOYMENT / [ ] NEEDS FIXES

---

## 🐛 **ISSUES FOUND**

### Critical (Must Fix Before Deploy)

1.
2.
3.

### Major (Should Fix Before Deploy)

1.
2.
3.

### Minor (Can Fix After Deploy)

1.
2.
3.

---

## ✅ **PRE-DEPLOYMENT FINAL CHECKLIST**

- [ ] All critical tests PASS
- [ ] No critical or major bugs
- [ ] Production build successful
- [ ] `.env.local` not committed
- [ ] `BETTER_AUTH_SECRET` changed to strong value
- [ ] All environment variables documented
- [ ] README.md updated
- [ ] Code committed and pushed to GitHub

---

## 🚀 **READY TO DEPLOY?**

**Decision:** [ ] YES - Proceed to Vercel / [ ] NO - Fix issues first

**Signed:** ****\_\_\_****  
**Date:** ****\_\_\_****

---

**Next Steps After Testing:**

1. Fix all critical issues
2. Update `BETTER_AUTH_SECRET` in `.env.local`
3. Push final code to GitHub
4. Deploy to Vercel
5. Update production environment variables
6. Test on production
7. Update Supabase allowed URLs
