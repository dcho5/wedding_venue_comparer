# Wedding Venue Comparer 💍

A multi-platform wedding venue comparison app with **100% data parity** across web, iOS, and Android. Add venues, upload photos, and compare costs — changes sync instantly across all platforms.

**Live:** https://dcho5.github.io/wedding_venue_comparer/ | **iOS:** Live (see demo below) | **Android:** Play Store (coming soon)

---

## 📱 Platforms

| Platform | Stack | Status |
|----------|-------|--------|
| **Web** | React 18, Firebase, GitHub Pages | ✅ Live |
| **iOS** | SwiftUI, Firebase, Xcode | ✅ Live |
| **Android** | Jetpack Compose, Firebase | 📋 Planned |
| **Backend** | Express.js, Cloud Run | ✅ Live |

---

## 🎬 Demo

### Web App
<!-- Drag and drop a screen recording here via the GitHub README editor -->
*Web demo video coming soon*

### iOS App
https://github.com/user-attachments/assets/5518e5eb-8e27-42e8-bc78-e6801b230137

---

## 🚀 Quick Start

### Web
```bash
cd web
npm install
npm start  # http://localhost:3000
```

### Backend (optional)
```bash
cd backend
npm install
npm start  # http://localhost:5001
```

### iOS
```bash
cd ios
# Open WeddingVenueComparer.xcodeproj in Xcode
# See ios/README.md for complete setup
```

---

## 📂 Project Structure

```
wedding_venue_comparer/
├── assets/
│   └── icon.png                # 1024×1024 master icon (source for all platforms)
│
├── backend/                    # Express REST API
│   ├── server.js
│   ├── package.json
│   └── .env                    # Firebase Admin credentials
│
├── web/                        # React web app
│   ├── src/
│   │   ├── App.js
│   │   ├── Auth.js
│   │   ├── VenueList.js
│   │   ├── VenueForm.js
│   │   ├── VenueDetail.js
│   │   ├── VenueComparison.js
│   │   ├── VenuePhoto.js
│   │   ├── venueUtils.js       # Formatting, cost calc & highlight logic
│   │   ├── api.js
│   │   ├── firebaseConfig.js
│   │   ├── styles.css
│   │   ├── auth-styles.css
│   │   └── index.js
│   ├── package.json
│   └── .env                    # Firebase public config
│
├── ios/                        # SwiftUI iOS app
│   ├── WeddingVenueComparer/
│   │   ├── Models/Venue.swift
│   │   ├── Views/
│   │   ├── Services/
│   │   └── Utilities/VenueUtils.swift
│   ├── README.md
│   └── BUILD_SETTINGS.md
│
├── android/                    # Planned
│   └── README.md
│
└── README.md                   # This file
```

---

## 🔄 Data Flow & Sync

```
iOS App ──┐
Web App ──┼──▶ Firestore ◀── Firebase Auth & Storage
Android ──┘         │
                REST API (Express / Cloud Run)
```

All platforms share the **same Firebase project**, so changes sync in real time:
- Add a venue on web → appears on iOS instantly via Firestore listener
- Edit a venue on iOS → visible on web after refresh
- Upload a photo on any platform → accessible everywhere

---

## 📋 Shared Data Model

All platforms use the same Firestore schema (snake_case field names):

```javascript
Venue {
  id: String
  name: String
  guest_count: Number           // default: 100
  event_duration_hours: Number  // default: 12
  venue_rental_cost: Number
  catering_per_person: Number
  catering_flat_fee: Number
  bar_service_rate: Number      // NOTE: not bar_per_person
  bar_flat_fee: Number
  coordinator_fee: Number
  event_insurance: Number
  other_costs: Number
  notes: String
  title_photo: String           // URL or Storage path
  created_at: Timestamp
  updated_at: Timestamp
}
```

---

## 💰 Cost Calculation (Identical Across Platforms)

```
Total = Venue Rental
      + (Catering/Person × Guests + Catering Flat Fee)
      + (Bar/Person × Guests + Bar Flat Fee)
      + Coordinator Fee + Insurance + Other Costs

Per Guest = Total ÷ Guest Count
```

**Implemented in:**
- Web: `web/src/venueUtils.js` (`calcCatering`, `calcBar`, `calcTotal`, `calcPerGuest`)
- iOS: `ios/.../Models/Venue.swift` (`totalCost` computed property)
- Android: coming soon

---

## 🎨 Highlighting Rules (Identical Across Platforms)

| Value | Color | Meaning |
|-------|-------|---------|
| Lowest cost | 🟢 Green | Best value |
| Highest cost | 🔴 Red | Worst value |
| All equal (non-zero) | ⚫ Grey | Neutral |
| All zero | — | No highlight |

**Implemented in:**
- Web: `web/src/venueUtils.js` (`getHighlightClass`, `getComparisonClass`, `getMobileCardClass`)
- iOS: `ios/.../Utilities/VenueUtils.swift`
- Android: coming soon

---

## 🖼️ App Icon

The master icon lives at `assets/icon.png` (1024×1024 PNG) and is the source for all platform icons.

| Platform | How it's used |
|----------|---------------|
| **iOS** | Imported into `Assets.xcassets` → `AppIcon` in Xcode |
| **Web** | Copied to `web/public/` as `favicon.ico` / `logo192.png` / `logo512.png` |
| **Android** | Used to generate mipmap drawables via Android Studio (coming soon) |

See each platform's README for exact steps.

---

## 🌙 Dark Mode

Both web and iOS support automatic dark mode based on system preference.

- **Web:** `styles.css` and `auth-styles.css` use `@media (prefers-color-scheme: dark)`
- **iOS:** Uses semantic SwiftUI colors (`Color(.systemBackground)`, `Color(.separator)`, etc.)

---

## 🔐 Authentication

All platforms use Firebase Auth with the same user account. Sign up on any platform and log in with the same credentials on any other.

User data is isolated by UID in Firestore:
```
/users/{uid}/venues/{venueId}/
/users/{uid}/venues/{venueId}/photos/{photoId}/
```

---

## 🗄️ Firebase Setup

**Project:** `wedding-venue-comparer`
- **Database:** Cloud Firestore (nam5 region)
- **Storage:** Firebase Storage (shared across all platforms)
- **Auth:** Firebase Authentication

To add a new platform: Firebase Console → Project Settings → Add App → select platform → download config file.

---

## ⚙️ Environment Configuration

### Web (`web/.env`)
```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=wedding-venue-comparer
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_API_URL=https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api
```

### Backend (`backend/.env`)
```env
PORT=5001
FIREBASE_PROJECT_ID=wedding-venue-comparer
FIREBASE_STORAGE_BUCKET=wedding-venue-comparer.firebasestorage.app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### iOS
- Add `GoogleService-Info.plist` from Firebase Console
- Backend URL set in `Services/APIService.swift`

---

## 🚀 Deployment

### Web (GitHub Pages)
```bash
cd web
npm run build
npm run deploy
# Live at https://dcho5.github.io/wedding_venue_comparer/
```

### Backend (Google Cloud Run)
```bash
gcloud run deploy wedding-venue-backend \
  --source backend \
  --region us-central1 \
  --set-env-vars FIREBASE_PROJECT_ID=wedding-venue-comparer,FIREBASE_STORAGE_BUCKET=wedding-venue-comparer.firebasestorage.app
```

### iOS (TestFlight / App Store)
- Product → Archive → Distribute App in Xcode
- Upload to App Store Connect

---

## ✅ Testing Cross-Platform Sync

1. Add a venue on **web** → verify it appears on **iOS** instantly
2. Edit that venue on **iOS** → refresh web and verify changes appear
3. Upload a photo on **web** → confirm it's visible on **iOS**
4. Delete a venue on either platform → confirm it's removed on both

---

## 📚 Further Documentation

- [Web App](web/README.md)
- [iOS App](ios/README.md)
- [Backend API](backend/README.md)

---

## License

UNLICENSED — Private project
