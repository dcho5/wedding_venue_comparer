# Wedding Venue Comparer 💍

A multi-platform wedding venue comparison application with **100% data parity** across web, iOS, and Android. Add venues, upload photos, and compare costs—changes sync instantly across all platforms.

**Live:** https://dcho5.github.io/wedding_venue_comparer/ | **iOS:** TestFlight (coming soon) | **Android:** Play Store (coming soon)

## 📱 Platforms

| Platform | Stack | Status | Access |
|----------|-------|--------|--------|
| **Web** | React 18, Firebase, GitHub Pages | ✅ Live | https://dcho5.github.io/wedding_venue_comparer/ |
| **iOS** | SwiftUI, Firebase, Xcode | 🔨 Building | See `/ios/README.md` |
| **Android** | Jetpack Compose, Firebase, Android Studio | 📋 Planned | See `/android/` |
| **Backend** | Express.js, Cloud Run | ✅ Live | Cloud Run (REST API) |

> **Note:** Android implementation is planned but not yet available in this repository.

> **Backend API:** Access the REST API at `https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api`.

## 🎯 Why This Project?


## 🚀 Quick Start

### Run Web Locally
```bash
cd web
npm install
npm start  # http://localhost:3000
```

### Run Backend Locally (optional)
```bash
cd backend
npm install
npm start  # http://localhost:5001
```

### Build iOS App
```bash
cd ios
# Open WeddingVenueComparer.xcodeproj in Xcode
# See ios/README.md for complete setup
```

## 📊 Project Structure

```
wedding_venue_comparer_021526/
├── backend/           # Express REST API
│   ├── server.js
│   ├── package.json
│   └── .env           # Firebase Admin credentials
│
├── web/               # React web app
│   ├── src/
│   │   ├── App.js
│   │   ├── VenueList.js
│   │   ├── VenueForm.js
│   │   ├── VenueComparison.js
│   │   ├── highlightUtils.js
│   │   └── ...
│   ├── package.json
│   └── .env           # Firebase public config
│
├── ios/               # SwiftUI iOS app
│   ├── WeddingVenueComparer/
│   │   ├── Models/Venue.swift
│   │   ├── Views/
│   │   ├── Services/
│   │   └── Utilities/HighlightUtils.swift
│   ├── README.md
│   └── BUILD_SETTINGS.md
│
├── android/           # Android app (coming soon)
│   └── README.md      # Placeholder
│
└── README.md          # This file
```

## 🔄 Data Flow & Sync

```
iOS App ──┐
Web App ──┼─→ Firestore ← Firebase Auth & Storage
Android ──┘      ↓
            REST API (Express Backend)
            Cloud Run (Production)
```

**Real-time Synchronization:**
- Firestore real-time listeners (iOS, Android, Web)
- REST API for validation & business logic
- Shared data models (exact field names across platforms)

**Example Sync Flow:**
1. User adds venue on **web app**
2. Data written to Firestore
3. iOS app's real-time listener detects change
4. iOS UI updates **instantly** (no refresh needed)
5. User edits venue on **iOS app**
6. Data updated in Firestore
7. Web app refreshes and shows changes

## 📋 Shared Data Model

All platforms use identical Firestore schema (snake_case):

```javascript
Venue {
  id: String
  name: String
  guest_count: Number (default: 100)
  event_duration_hours: Number (default: 12)
  venue_rental_cost: Number
  catering_per_person: Number
  catering_flat_fee: Number
  bar_service_rate: Number       // NOT bar_per_person
  bar_flat_fee: Number
  coordinator_fee: Number
  event_insurance: Number
  other_costs: Number
  notes: String
  photos: [Photo]
  created_at: Timestamp
  updated_at: Timestamp
}
```

## 💰 Cost Calculation (Identical Everywhere)

```
Total = Venue Rental 
      + (Catering/Person × Guests + Catering Flat)
      + (Bar/Person × Guests + Bar Flat)
      + Coordinator Fee + Insurance + Other

Per Guest = Total ÷ Guest Count
```

**Implemented in:**
- Web: `web/src/App.js` (calculateTotal)
- iOS: `ios/WeddingVenueComparer/Models/Venue.swift` (totalCost computed property)
- Android: (coming soon)

## 🎨 Highlighting Rules (Identical Everywhere)

Cost comparison highlighting logic ported across all platforms:

| Value | Color | Meaning |
|-------|-------|---------|
| Lowest cost | 🟢 Green | Best value |
| Highest cost | 🔴 Red | Worst value |
| All equal | ⚫ Grey | Neutral |

**Implemented in:**
- Web: `web/src/highlightUtils.js`
- iOS: `ios/WeddingVenueComparer/Utilities/HighlightUtils.swift`
- Android: (coming soon)

## 🔐 Authentication

All platforms use **Firebase Auth** with the same user account:

1. Sign up on web app
2. Log in on iOS with same email/password
3. Access your venues and photos across platforms

User data isolated by `user_id` in Firestore:
```
/users/{uid}/venues/{venueId}/
/users/{uid}/venues/{venueId}/photos/{photoId}/
```

## 🗄️ Firebase Setup (Shared)

- **Project:** `wedding-venue-comparer` (all platforms)
- **Database:** Firestore (nam5 region)
- **Storage:** Firebase Storage (all platforms use same bucket)
- **Auth:** Firebase Authentication

### Add New Platform to Firebase

1. Go to Firebase Console → Project Settings
2. Click "Add App" → Select platform (iOS, Android, Web)
3. Download config file (GoogleService-Info.plist for iOS, google-services.json for Android)
4. Add to project and follow setup guide

## 🚀 Deployment

### Web (GitHub Pages)
```bash
cd web
npm run deploy
# Live at https://dcho5.github.io/wedding_venue_comparer/
```

### Backend (Google Cloud Run)
```bash
gcloud run deploy wedding-venue-backend \
  --source backend \
  --region us-central1
```

### iOS (TestFlight/App Store)
```bash
# In Xcode:
# Product → Archive → Distribute App
# Upload to App Store Connect
```

### Android (Google Play)
Coming soon

## ✅ Testing Cross-Platform Sync

1. **Add venue on web:**
   ```
   Web: Click "Add Venue" → Fill form → Save
   ```

2. **Verify on iOS instantly:**
   ```
   iOS: VenueList updates automatically (no refresh)
   ```

3. **Edit on iOS:**
   ```
   iOS: Select venue → Edit costs → Save
   ```

4. **Check web app:**
   ```
   Web: Refresh browser → Changes appear
   ```

## 📚 Documentation

- [Web App Details](web/README.md)
- [iOS App Details](ios/README.md)
- [Backend API Docs](backend/README.md) (if exists)
- [Android Setup](android/README.md) (coming soon)

## ⚙️ Environment Configuration

## Features ✨

### Cost Management
- **Visual Cost Cards** - Intuitive cards for each cost category with live calculations
- **Flexible Pricing** - Per-person rates + flat fees for catering and bar service
- **Categories:** Venue Rental, Catering, Bar Service, Coordinator Fee, Event Insurance, Other Costs
- **Calculated Totals** - Real-time per-guest and total cost calculations

### Photo Management
- **Drag & Drop** - Upload photos directly from your device
- **Thumbnail Gallery** - Visual preview with title photo selection
- **Cloud Storage** - Photos stored securely in Firebase Storage
- **Lightbox View** - Full-screen photo viewer

### Venue Comparison
- **Desktop Grid View** - Side-by-side comparison of all metrics
- **Mobile Card View** - Dropdown metric selector for easy comparison on phones
- **Smart Highlighting** - Best values in green, worst in red, neutral in grey
- **Photo Display** - See venue photos alongside comparison data

### Responsive Design
- **Desktop** - Grid layout for comprehensive comparison
- **Mobile** - Card-based layout with metric selector
- **Breakpoint:** Automatically switches at 768px width

## Technology Stack

| Layer | Web | iOS | Android | Backend |
|-------|-----|-----|---------|---------|
| **UI** | React 18 | SwiftUI | Jetpack Compose (planned) | N/A |
| **Auth** | Firebase Auth | Firebase Auth | Firebase Auth | Firebase Admin SDK |
| **Database** | Firestore | Firestore | Firestore | Firestore |
| **Storage** | Firebase Storage | Firebase Storage | Firebase Storage | Firebase Storage |
| **API** | REST (Axios) | REST (URLSession) | REST (Retrofit) | Express.js |
| **Deploy** | GitHub Pages | TestFlight/App Store | Google Play | Cloud Run |

## Data Storage

- **Database:** Cloud Firestore (nam5 region)
- **Photos:** Firebase Storage
- **Authentication:** Firebase Auth

## Usage Guide

### Adding a Venue
1. Click "Add Venue"
2. Enter name (required), adjust guests & duration
3. Fill cost details, add notes
4. Upload photos via drag-drop or file selection
5. Click any photo to mark as title photo
6. Save

### Comparing Venues
1. Click "Compare All Venues"
2. **Desktop:** View grid layout with all venues side-by-side
3. **Mobile:** Use dropdown to select metric, swipe through venue cards
4. Green = best value, Red = worst value, Grey = all equal

### Cost Calculation
```
Total = Venue Rental 
      + (Catering Rate × Guests + Catering Flat Fee)
      + (Bar Rate × Guests + Bar Flat Fee)
      + Coordinator Fee + Event Insurance + Other Costs

Per Guest = Total ÷ Guest Count
```

## Project Structure

```
wedding_venue_comparer_021526/
├── frontend/              # React application
│   ├── src/
│   │   ├── App.js
│   │   ├── VenueList.js
│   │   ├── VenueForm.js
│   │   ├── VenueComparison.js
│   │   ├── highlightUtils.js
│   │   └── ...
│   ├── package.json
│   └── .env               # Firebase config
├── backend/               # Express API
│   ├── server.js
│   ├── package.json
│   └── .env               # Firebase Admin config
└──Cross-Platform Synchronization

All platforms use the **same Firebase project** and **same REST API**, ensuring **100% data parity**:

- ✅ Add venue on iOS → appears on web instantly
- ✅ Edit venue on Android → updates on iOS immediately
- ✅ Upload photo on web → visible on iOS/Android
- ✅ Delete venue on any platform → removes everywhere

Powered by Firestore real-time listeners and shared REST API.

## Deployment

### Frontend (GitHub Pages)
```bash
cd frontend
npm run deploy
```
Live at: https://dcho5.github.io/wedding_venue_comparer/

### Backend (Google Cloud Run)
```bash
gcloud run deploy wedding-venue-backend \
  --source backend \
  --region us-central1 \
  --set-env-vars FIREBASE_PROJECT_ID=wedding-venue-comparer,FIREBASE_STORAGE_BUCKET=wedding-venue-comparer.firebasestorage.app
```

### iOS App (TestFlight/App Store)
1. Update version in Xcode
2. Archive app
3. Upload to App Store Connect
4. Submit for review

### Android App (Google Play)
- Coming soon

## Environment Setup

### Firebase
All platforms share the **same Firebase project**: `wedding-venue-comparer`
- Database: Cloud Firestore (nam5 region)
- Storage: Firebase Storage
- Auth: Firebase Authentication

Add your iOS/Android app in Firebase Console → Project Settings → Add iOS/Android app

### Backend Environment Variables
Set in Cloud Run service:
```env
FIREBASE_PROJECT_ID=wedding-venue-comparer
FIREBASE_STORAGE_BUCKET=wedding-venue-comparer.firebasestorage.app
NODE_ENV=production
```

### Web Environment Variables
Set in `frontend/.env`
```env
REACT_APP_API_URL=https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api
REACT_APP_FIREBASE_*=... # Firebase config from Console
```

### iOS Environment Variables
Added via Xcode build settings or Info.plist
- GoogleService-Info.plist from Firebase Console
- Backend URL hardcoded in `Services/APIService.swift`

### Android Environment Variables
Coming soon with Android implementation

### Previous Deployment Documentation
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables from `

## Environment Setup

### Frontend (.env)
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_URL=http://localhost:5001/api
```

### Backend (.env)
```env
PORT=5001
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Security

- Firebase API key is restricted to specific domains and APIs
- Backend uses Firebase Admin SDK for secure database access
- `.env` files are gitignored
- Firestore security rules enforce user-level isolation

## License

UNLICENSED - Private project
