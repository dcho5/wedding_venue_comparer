# Browser Version - Setup Summary

Your web version is ready! Here's what's been created:

## 📁 Project Structure

```
wedding_venue_compare_tool_021526/
├── src/                          (existing Electron app)
├── main.js                       (existing Electron app)
├── preload.js                    (existing Electron app)
├── package.json                  (updated - removed MIT license)
└── web/                          ⭐ NEW WEB VERSION
    ├── backend/
    │   ├── server.js            # Express + Firebase API
    │   ├── package.json         # Node dependencies
    │   └── .env.example         # Fill with Firebase credentials
    ├── frontend/
    │   ├── src/
    │   │   ├── index.js         # React entry point
    │   │   ├── App.js           # Main app (venues, search, sort)
    │   │   ├── Auth.js          # Login/signup page
    │   │   ├── VenueList.js     # Cards grid with selection
    │   │   ├── VenueForm.js     # Add/edit venue modal
    │   │   ├── VenueComparison.js # Side-by-side comparison
    │   │   ├── api.js           # API client with axios
    │   │   ├── firebaseConfig.js # Firebase initialization
    │   │   └── styles.css       # All styling (responsive)
    │   ├── public/index.html
    │   ├── package.json         # React dependencies
    │   └── .env.example         # Fill with Firebase config
    ├── README.md                # Web app overview
    ├── SETUP_GUIDE.md           # Step-by-step setup
    ├── API_REFERENCE.md         # Backend API docs
    ├── FIRESTORE_RULES.txt      # Firestore security rules
    ├── STORAGE_RULES.txt        # Storage security rules
    ├── setup.sh                 # Automated setup script
    └── .gitignore               # Ignore node_modules, .env

```

## 🚀 Quick Start (3 Steps)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Create new project (free tier is fine)
3. Enable Authentication, Firestore, and Storage (test mode)
4. Get credentials (see SETUP_GUIDE.md for details)

### Step 2: Configure Environment Files
```bash
# Backend credentials (from Firebase Service Account)
web/backend/.env

# Frontend config (from Firebase Web Config)
web/frontend/.env
```

### Step 3: Run Setup & Start
```bash
# Automated setup
cd web
bash setup.sh

# Terminal 1: Backend
cd web/backend
npm run dev

# Terminal 2: Frontend
cd web/frontend
npm start
```

Then open http://localhost:3000 and sign up!

## 🔑 Key Features Implemented

✅ **Authentication**
- Firebase sign up/sign in
- Persistent login (localStorage)
- Sign out functionality

✅ **Venues (Full CRUD)**
- Add venues with all cost fields
- Edit existing venues
- Delete venues (with confirmation)
- Multi-select for comparison/deletion

✅ **Cost Tracking**
- Venue rental
- Catering (per person + flat fee)
- Bar service (per person + flat fee)
- Coordinator fee
- Event insurance
- Other costs
- Live total & per-guest calculations

✅ **Photos**
- Upload to Firebase Storage
- Display in venue form
- Delete photos
- Retrieve signed URLs

✅ **Search & Sort**
- Real-time search by venue name
- Sort by date added, cost, or name

✅ **Comparison View**
- Select 2-3 venues
- Side-by-side cost breakdown
- Highlights best/worst costs
- Responsive grid layout

✅ **Responsive Design**
- Works on desktop, tablet, mobile
- Mobile-first CSS
- Touch-friendly buttons

## 📊 Technology Stack

**Frontend**
- React 18
- Firebase SDK (auth, storage)
- Axios (HTTP client)
- CSS (no frameworks, vanilla)

**Backend**
- Node.js + Express.js
- Firebase Admin SDK
- Multer (file uploads)
- CORS enabled

**Database & Storage**
- Firebase Firestore (NoSQL)
- Firebase Storage (photos)
- Firebase Auth

## 🔐 Security

- User authentication required
- Data isolated per user (Firestore rules)
- Service account uses private key (backend only)
- Frontend uses public web API key
- Photos in signed storage URLs

See `FIRESTORE_RULES.txt` and `STORAGE_RULES.txt` to apply security rules in Firebase Console.

## 📚 Documentation

1. **[SETUP_GUIDE.md](web/SETUP_GUIDE.md)** - Detailed installation & troubleshooting
2. **[API_REFERENCE.md](web/API_REFERENCE.md)** - Backend endpoint documentation
3. **[README.md](web/README.md)** - Web version overview

## 🚨 Before Running

1. ✅ Create Firebase project
2. ✅ Enable Authentication, Firestore, Storage
3. ✅ Fill `web/backend/.env` with service account credentials
4. ✅ Fill `web/frontend/.env` with web config
5. ✅ Run `npm install` in both backend & frontend

## 📱 What's Different from Desktop Version?

| Aspect | Desktop (Electron) | Web (React) |
|--------|-------------------|-----------|
| **Data** | SQLite (local) | Firestore (cloud) |
| **Photos** | Local files | Firebase Storage |
| **Access** | Single computer | Any browser, any device |
| **Sync** | Manual export/import | Automatic cloud sync |
| **Auth** | None (local) | Email/password login |
| **Offline** | Yes | No (needs internet) |
| **Deployment** | .dmg/.exe file | Browser (deploy anywhere) |

## 🎯 Next Steps After Setup

1. Run the app and test all features
2. Export/import data from desktop version (JSON export, then manual entry)
3. Deploy backend to Heroku or similar
4. Deploy frontend to Vercel, Firebase Hosting, or similar
5. Share the URL with others for multi-device access

## 🆘 Common Issues

**"Cannot find module 'express'"**
→ Run `npm install` in backend folder

**"Firebase credentials not found"**
→ Check `.env` files are filled with your actual credentials

**"API_URL not found"**
→ Make sure backend is running (`npm run dev`)

**"Photos not uploading"**
→ Check Firebase Storage is enabled and rules are applied

**"Login not working"**
→ Verify Firebase Authentication is enabled (Email/Password)

## 📖 See Also

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)

---

**Your desktop version is still available!** This is an additional web version alongside the existing Electron app.
