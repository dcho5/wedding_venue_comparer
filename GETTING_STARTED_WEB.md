# Web Version - Getting Started Checklist

## ✅ Pre-Setup (Firebase)

- [ ] Create Firebase project at https://console.firebase.google.com/
- [ ] Enable Authentication → Email/Password sign-in method
- [ ] Create Firestore Database (select "Start in test mode")
- [ ] Enable Cloud Storage (select "Start in test mode")
- [ ] Apply Firestore security rules from `web/FIRESTORE_RULES.txt`
- [ ] Apply Storage security rules from `web/STORAGE_RULES.txt`

## 📋 Firebase Credentials Collection

### Backend (Service Account)
- [ ] Go to Project Settings → Service Accounts
- [ ] Generate new private key (JSON)
- [ ] Copy these values to `web/backend/.env`:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_STORAGE_BUCKET`

### Frontend (Web Config)
- [ ] Go to Project Settings → General
- [ ] Under "Your apps" create Web app
- [ ] Copy these values to `web/frontend/.env`:
  - `REACT_APP_FIREBASE_API_KEY`
  - `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - `REACT_APP_FIREBASE_PROJECT_ID`
  - `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - `REACT_APP_FIREBASE_APP_ID`

## 🚀 Installation

- [ ] Have Node.js 16+ installed (`node --version`)
- [ ] Automated setup:
  ```bash
  cd web
  bash setup.sh
  ```
  OR manual:
  ```bash
  cd web/backend && npm install
  cd ../frontend && npm install
  ```

## ⚙️ Configuration

- [ ] Fill `web/backend/.env` with service account credentials
- [ ] Fill `web/frontend/.env` with web config
- [ ] Set `REACT_APP_API_URL=http://localhost:5000/api` in frontend `.env`

## 🏃 Running the App

**Terminal 1 - Backend:**
```bash
cd web/backend
npm run dev
# Should output: "Server running on http://localhost:5000"
```

**Terminal 2 - Frontend:**
```bash
cd web/frontend
npm start
# Should open http://localhost:3000 in browser
```

## ✨ Testing the App

- [ ] Sign up with email and password
- [ ] Create a venue
- [ ] Edit the venue
- [ ] Upload a photo
- [ ] Create a second venue
- [ ] Select both venues and compare
- [ ] Search venues
- [ ] Sort by cost/name/date
- [ ] Delete a venue
- [ ] Sign out and sign back in (verify data persists)

## 🔍 Troubleshooting

If something doesn't work:

**Backend won't start:**
- [ ] Check `web/backend/.env` is filled correctly
- [ ] Run `npm install` again in backend folder
- [ ] Check port 5000 is not in use

**Frontend won't load:**
- [ ] Check `web/frontend/.env` is filled correctly
- [ ] Run `npm install` again in frontend folder
- [ ] Check backend is running
- [ ] Open browser console (F12) for errors

**Auth doesn't work:**
- [ ] Verify Firebase Authentication is enabled
- [ ] Check REACT_APP_FIREBASE_API_KEY in `.env`
- [ ] Check Firebase project settings

**Photos won't upload:**
- [ ] Check Firebase Storage is enabled
- [ ] Verify storage rules are applied
- [ ] Check browser console for CORS errors

**Data not saving:**
- [ ] Check Firestore database exists
- [ ] Verify Firestore rules are applied
- [ ] Check backend console for database errors

## 📚 Documentation

Read these in order:
1. `web/README.md` - Overview
2. `web/SETUP_GUIDE.md` - Detailed setup steps
3. `web/API_REFERENCE.md` - Backend API docs

## 🚀 Next: Deployment

### Backend (e.g., Heroku)
```bash
cd web/backend
heroku login
heroku create your-app-name
git push heroku main
```

### Frontend (e.g., Vercel)
```bash
cd web/frontend
npm run build
# Deploy `build/` folder to Vercel, Netlify, or Firebase Hosting
```

Update `REACT_APP_API_URL` in frontend `.env` to your deployed backend URL.

## 📞 Support

- Firebase issues: https://firebase.google.com/docs
- React issues: https://react.dev
- Express issues: https://expressjs.com

---

**You have two versions now:**
- **Electron** (Desktop): `npm start` in root - local data, no login
- **React** (Web): Follow this checklist - cloud data, requires login
