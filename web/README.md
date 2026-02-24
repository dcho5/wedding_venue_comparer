# Wedding Venue Comparer - Web App

A React web application for comparing wedding venues with cost breakdowns, photo galleries, and responsive design for desktop and mobile.

**Live Demo:** https://dcho5.github.io/wedding_venue_comparer/

## 🎬 Demo

<!-- Drag and drop a screen recording (.mp4 or .gif) here via the GitHub README editor -->
*Demo video coming soon*


---

## Features ✨

### Cost Management
- **Visual Cost Cards** — Intuitive cards for each cost category with live calculations
- **Flexible Pricing** — Per-person rates + flat fees for catering and bar service
- **Categories:** Venue Rental, Catering, Bar Service, Coordinator Fee, Event Insurance, Other Costs
- **Real-time Totals** — Per-guest and total cost calculated instantly

### Photo Management
- **Drag & Drop** — Upload photos directly from your device
- **Thumbnail Gallery** — Visual preview with title photo selection
- **Cloud Storage** — Photos stored securely in Firebase Storage
- **Lightbox View** — Full-screen photo viewer with keyboard navigation

### Venue Comparison
- **Desktop Grid View** — Side-by-side comparison of all metrics
- **Mobile Card View** — Dropdown metric selector for easy comparison on phones
- **Smart Highlighting** — Best values in green, worst in red, neutral in grey
- **Photo Display** — See venue photos alongside comparison data

### Responsive Design
- **Desktop** — Grid layout for comprehensive comparison
- **Mobile** — Card-based layout with metric selector
- Automatically switches at 768px

### Dark Mode
- Automatic dark mode via `@media (prefers-color-scheme: dark)` in `styles.css` and `auth-styles.css`
- No configuration needed — follows the user's OS preference

---

## Tech Stack

- **Frontend:** React 18, Firebase SDK (Auth, Storage)
- **Database:** Cloud Firestore (shared with iOS)
- **Storage:** Firebase Storage (shared with iOS)
- **Authentication:** Firebase Auth
- **Deployment:** GitHub Pages
- **API:** Express backend at `https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api`

---

## Setup

### Prerequisites
- Node.js 16+ and npm
- Firebase project configured (`wedding-venue-comparer`)

### Installation
```bash
cd web
npm install
```

### Development
```bash
npm start
# Opens http://localhost:3000
```

### Production Build & Deploy
```bash
npm run build
npm run deploy  # Deploys to GitHub Pages
```

---

## Project Structure

```
web/
├── public/
│   ├── index.html
│   ├── favicon.ico         # Generated from assets/icon.png
│   ├── logo192.png         # Generated from assets/icon.png
│   └── logo512.png         # Generated from assets/icon.png
└── src/
    ├── App.js              # Main app logic (venues, state)
    ├── Auth.js             # Login/signup
    ├── VenueList.js        # List view with search/sort
    ├── VenueForm.js        # Add/edit form with photo upload
    ├── VenueDetail.js      # Detail modal
    ├── VenueComparison.js  # Side-by-side comparison
    ├── VenuePhoto.js       # Photo component
    ├── venueUtils.js       # Shared formatting, cost calc & highlight logic
    ├── api.js              # REST API client
    ├── firebaseConfig.js   # Firebase setup
    ├── styles.css          # Global styles (includes dark mode)
    ├── auth-styles.css     # Auth screen styles (includes dark mode)
    └── index.js
```

---

## 🖼️ App Icon

The master icon is at `assets/icon.png` (1024×1024) in the project root.

To update the web icons, upload `assets/icon.png` to [favicon.io](https://favicon.io/favicon-converter/) and copy the output files as follows:

| favicon.io file | Destination |
|----------------|-------------|
| `favicon.ico` | `web/public/favicon.ico` |
| `favicon-32x32.png` | `web/public/favicon-32x32.png` |
| `favicon-16x16.png` | `web/public/favicon-16x16.png` |
| `android-chrome-512x512.png` | `web/public/logo512.png` |
| `android-chrome-192x192.png` | `web/public/logo192.png` |

---

## Data Model

Exact field names matching iOS and Android (snake_case):

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

## Cost Calculation

Implemented in `src/venueUtils.js` (`calcCatering`, `calcBar`, `calcTotal`, `calcPerGuest`) — identical across all platforms:

```
Total = Venue Rental
      + (Catering Rate × Guests + Catering Flat Fee)
      + (Bar Rate × Guests + Bar Flat Fee)
      + Coordinator Fee + Event Insurance + Other Costs

Per Guest = Total ÷ Guest Count
```

---

## Highlighting Logic

Implemented in `src/venueUtils.js` (`getHighlightClass`, `getComparisonClass`, `getMobileCardClass`):

| Value | Color | Meaning |
|-------|-------|---------|
| Lowest cost | 🟢 Green | Best value |
| Highest cost | 🔴 Red | Worst value |
| All equal (non-zero) | ⚫ Grey | Neutral |
| All zero | — | No highlight |

---

## Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=wedding-venue-comparer
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_API_URL=https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api
```

Get these values from Firebase Console → Project Settings.

---

## Cross-Platform Sync

Changes made in the web app sync instantly with iOS/Android via Firestore real-time listeners:
- Add/edit/delete venue on web → appears on iOS immediately
- Upload photo on web → visible on iOS
- All platforms share the same Firebase project and backend

**Keep platforms in sync:**
1. Make schema/backend changes first
2. Update web implementation
3. Update iOS/Android to match
4. Test cross-platform sync before merging

---

## Troubleshooting

**Backend not responding:**
- Check Cloud Run at `https://cloud.google.com/run`
- Verify `REACT_APP_API_URL` in `.env`

**Photos not uploading:**
- Verify `REACT_APP_FIREBASE_STORAGE_BUCKET` in `.env`
- Check browser console for CORS errors

**Data not syncing:**
- Ensure both platforms use the same Firebase project
- Check Firestore field names are snake_case

---

## License

UNLICENSED — Private project