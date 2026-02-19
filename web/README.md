# Wedding Venue Comparer - Web App

A modern React web application for comparing wedding venues with cost breakdowns, photo galleries, and responsive design for desktop and mobile.

**Live Demo:** https://dcho5.github.io/wedding_venue_comparer/

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

## Tech Stack

- **Frontend:** React 18, Firebase SDK (Auth, Storage), Axios
- **Database:** Cloud Firestore (shared with iOS)
- **Storage:** Firebase Storage (shared with iOS and Android)
- **Authentication:** Firebase Auth
- **Deployment:** GitHub Pages
- **API:** Express backend at `https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api`

## Setup

### Prerequisites
- Node.js 16+ and npm
- Firebase project configured (wedding-venue-comparer)

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

### Production Build
```bash
npm run build
npm run deploy  # Deploy to GitHub Pages
```

## Data Model

Exact field names matching iOS and Android (snake_case):

```javascript
{
  id: String
  name: String
  guest_count: Number
  event_duration_hours: Number
  venue_rental_cost: Number
  catering_per_person: Number
  catering_flat_fee: Number
  bar_service_rate: Number
  bar_flat_fee: Number
  coordinator_fee: Number
  event_insurance: Number
  other_costs: Number
  notes: String
  photos: [{ url, caption, isTitle }]
  created_at: Timestamp
  updated_at: Timestamp
}
```

## Cost Calculation

Identical across all platforms:

```
Total = Venue Rental 
      + (Catering Rate × Guests + Catering Flat Fee)
      + (Bar Rate × Guests + Bar Flat Fee)
      + Coordinator Fee + Event Insurance + Other Costs

Per Guest = Total ÷ Guest Count
```

## Highlighting Logic

Matches iOS implementation in `highlightUtils.js`:
- 🟢 **Green** = Best value (lowest cost)
- 🔴 **Red** = Worst value (highest cost)
- ⚫ **Grey** = All values equal

## Cross-Platform Sync

Changes made in the web app instantly appear on iOS/Android through Firestore real-time listeners:
- Add/edit/delete venue on web → appears on iOS immediately
- Upload photo on web → visible on iOS
- All changes use shared Firebase backend

## Environment Configuration

### .env (required)
```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=wedding-venue-comparer
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
REACT_APP_API_URL=https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api
```

Get these values from Firebase Console → Project Settings

## Project Structure

```
web/
├── public/
│   └── index.html
├── src/
│   ├── App.js              # Main app logic (venues, state)
│   ├── Auth.js             # Login/signup
│   ├── VenueList.js        # List view with search/sort
│   ├── VenueForm.js        # Add/edit form with photo upload
│   ├── VenueDetail.js      # Detail modal
│   ├── VenueComparison.js  # Side-by-side comparison
│   ├── VenuePhoto.js       # Photo gallery component
│   ├── highlightUtils.js   # Cost highlighting (ported to Swift for iOS)
│   ├── api.js              # REST API client
│   ├── firebaseConfig.js   # Firebase setup
│   ├── styles.css          # Global styles
│   └── index.js
├── package.json
└── README.md
```

## Testing Cross-Platform Changes

1. Make a change in web app (add/edit/delete venue or upload photo)
2. Switch to iOS app
3. Changes appear **instantly** via Firestore real-time listeners
4. Edit in iOS app
5. Return to web app and refresh—changes appear

## Related Projects

- **iOS App**: `../ios/` (SwiftUI)
- **Android App**: `../android/` (Coming soon, Jetpack Compose)
- **Backend API**: `../backend/` (Express.js on Cloud Run)

## Maintenance

**When making changes:**
- Field names must remain snake_case (Firestore schema)
- Cost calculations must match iOS/Android exactly
- Highlighting logic must use same rules
- Tests should verify cross-platform sync works

Keep the three platforms in sync by:
1. Make backend/schema changes first
2. Update web implementation
3. Update iOS/Android to match
4. Test cross-platform sync before merging

## Troubleshooting

**Backend not responding:**
- Check Cloud Run service at `https://cloud.google.com/run`
- Verify `REACT_APP_API_URL` in .env

**Photos not uploading:**
- Verify Firebase Storage bucket in `.env`
- Check browser console for CORS errors

**Data not syncing:**
- Ensure both platforms use same Firebase project
- Check Firestore field names are snake_case

## License

UNLICENSED - Private project
