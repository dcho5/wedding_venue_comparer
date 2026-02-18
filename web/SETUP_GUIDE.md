# Wedding Venue Comparer - Web Version Setup Guide

## Overview

This is a React + Express + Firebase web version of the Wedding Venue Comparer app. It includes:

- **Frontend**: React SPA (Single Page App)
- **Backend**: Express.js server with Firebase Admin SDK
- **Database**: Firestore (cloud database)
- **Storage**: Firebase Storage (for photos)
- **Auth**: Firebase Authentication

## Prerequisites

- Node.js 16+ installed
- Firebase project created (free tier works)
- Firebase credentials set up

## Firebase Setup (Required First)

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name and create

### 2. Enable Services

1. **Authentication**: Go to Auth → Sign-in method → Enable Email/Password
2. **Firestore**: Go to Firestore Database → Create Database (start in test mode)
3. **Storage**: Go to Storage → Get Started (start in test mode)

### 3. Get Credentials

**For Frontend (.env):**
1. Project Settings → General → Scroll to "Your apps" → Web app
2. Copy the config values to `web/frontend/.env`

**For Backend (.env):**
1. Project Settings → Service Accounts → Generate new private key
2. Copy JSON values to `web/backend/.env`
3. Get Storage Bucket name from Storage tab

## Installation

### Backend Setup

```bash
cd web/backend
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
```

### Frontend Setup

```bash
cd web/frontend
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm start
```

## Environment Variables

### Backend (`web/backend/.env`)

```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
NODE_ENV=development
```

### Frontend (`web/frontend/.env`)

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the App

**Terminal 1 - Backend:**
```bash
cd web/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd web/frontend
npm start
```

The app will open at `http://localhost:3000`

## Features

✅ User authentication (sign up/sign in)
✅ Add/edit/delete venues
✅ Cost tracking with live calculations
✅ Multi-venue comparison (2-3 venues)
✅ Photo uploads to Firebase Storage
✅ Search and sort venues
✅ Responsive design (desktop & mobile)
✅ All data synced to cloud

## Project Structure

```
web/
├── backend/
│   ├── server.js           # Express server
│   ├── .env.example        # Environment template
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js        # React entry point
    │   ├── App.js          # Main app component
    │   ├── Auth.js         # Login/signup
    │   ├── VenueList.js    # Venue cards grid
    │   ├── VenueForm.js    # Add/edit venue form
    │   ├── VenueComparison.js # Comparison view
    │   ├── api.js          # API client
    │   ├── firebaseConfig.js   # Firebase setup
    │   └── styles.css      # All styling
    ├── .env.example
    └── package.json
```

## Troubleshooting

**"Cannot find module 'firebase-admin'"**
- Run `npm install` in backend folder

**Auth errors in console**
- Verify `.env` files are correct
- Check Firebase project has Auth enabled

**Photos not uploading**
- Check Firebase Storage bucket is created
- Verify service account has storage permissions
- Check browser console for CORS errors

**API errors (backend endpoint not found)**
- Make sure backend is running (`npm run dev`)
- Check `REACT_APP_API_URL` in frontend `.env`

## Deployment

### Backend (Heroku Example)

```bash
cd web/backend
heroku login
heroku create your-app-name
git push heroku main
# Set env vars in Heroku dashboard
```

### Frontend (Vercel/Firebase Hosting Example)

```bash
cd web/frontend
npm run build
# Deploy build folder to Vercel or Firebase Hosting
```

## Next Steps

- Add CSV export functionality
- Implement guest list management
- Add budget alerts
- Mobile app version (React Native)

## Support

For issues with Firebase setup, see [Firebase Docs](https://firebase.google.com/docs)
For issues with React, see [React Docs](https://react.dev)
