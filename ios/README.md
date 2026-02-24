# Wedding Venue Comparer - iOS App

A native iOS application for comparing wedding venues, built with **SwiftUI** and **Swift 6.0+**.

## 🎬 Demo

<!-- Drag and drop a screen recording (.mp4 or .gif) here via the GitHub README editor -->
*Demo video coming soon*

---

## Features ✨

- **Real-time Sync** — Changes sync instantly with web app via Firestore
- **Venue Management** — Add, edit, delete venues
- **Cost Breakdown** — Automatic locale-aware cost calculations
- **Photo Gallery** — Upload and manage venue photos with drag-to-reorder and lightbox view
- **Smart Comparison** — Side-by-side venue metrics with best/worst highlighting
- **Firebase Auth** — Secure email/password login and signup
- **Dark Mode** — Full support via SwiftUI semantic colors
- **Offline Support** — Firestore offline persistence

---

## Architecture

```
WeddingVenueComparer/
├── Models/
│   └── Venue.swift
├── Views/
│   ├── ContentView.swift
│   ├── AuthView.swift
│   ├── VenueListView.swift
│   ├── VenueFormView.swift
│   ├── VenueDetailView.swift
│   └── VenueComparisonView.swift
├── Services/
│   ├── FirebaseService.swift
│   └── APIService.swift
├── Utilities/
│   └── VenueUtils.swift        # Formatting, highlight logic
├── AppDelegate.swift
└── WeddingVenueComparerApp.swift
```

---

## Setup

### Prerequisites
- Xcode 15+ with iOS 15+ support
- Swift Package Manager
- Firebase account (using existing `wedding-venue-comparer` project)

### Install Dependencies
Add via Swift Package Manager in Xcode:
- `firebase-ios-sdk` (FirebaseAuth, FirebaseFirestore, FirebaseStorage)

### Firebase Configuration
1. Download `GoogleService-Info.plist` from Firebase Console → Project Settings → iOS app
2. Add to Xcode project (ensure "Copy items if needed" is checked)
3. Verify bundle ID matches Firebase project setup

### App Icon
The master icon is at `assets/icon.png` (1024×1024) in the project root.

To apply it in Xcode:
1. Open `Assets.xcassets` → `AppIcon`
2. Drag `assets/icon.png` into the **1024pt App Store** slot
3. Xcode will offer to auto-generate all required sizes — accept

### Run
```bash
open WeddingVenueComparer.xcodeproj
# Select WeddingVenueComparer scheme
# Build and run on simulator or device
```

---

## Shared Data Model

All fields match the web version exactly (snake_case in Firestore):

```swift
struct Venue {
    var id: String?
    var name: String
    var guest_count: Int
    var event_duration_hours: Double
    var venue_rental_cost: Double
    var catering_per_person: Double
    var catering_flat_fee: Double
    var bar_service_rate: Double       // NOTE: not bar_per_person
    var bar_flat_fee: Double
    var coordinator_fee: Double
    var event_insurance: Double
    var other_costs: Double
    var notes: String
    var title_photo: String?
    var created_at: Timestamp?
    var updated_at: Timestamp?
}
```

---

## Cost Calculation

Matches web app exactly. Implemented as computed properties in `Venue.swift`:

```
Total = Venue Rental
      + (Catering Rate × Guests + Catering Flat Fee)
      + (Bar Rate × Guests + Bar Flat Fee)
      + Coordinator Fee + Event Insurance + Other Costs

Per Guest = Total ÷ Guest Count
```

---

## Highlighting Logic

Ported from web `venueUtils.js` to Swift in `VenueUtils.swift`:

| Value | Color | Meaning |
|-------|-------|---------|
| Lowest cost | 🟢 Green | Best value |
| Highest cost | 🔴 Red | Worst value |
| All equal (non-zero) | ⚫ Grey | Neutral |
| All zero | — | No highlight |

---

## Currency Formatting

All monetary values use `VenueUtils.formatMoney()`, which uses `NumberFormatter` with `.currency` style and `.current` locale — mirrors `formatMoney()` in `web/src/venueUtils.js`.

---

## Backend Integration

The app uses two strategies simultaneously:

1. **Firebase Realtime Sync** (Primary)
   - Firestore for data storage
   - Firebase Storage for photos
   - Real-time listeners for instant updates

2. **REST API** (via APIService)
   - Backend URL: `https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api`
   - Used for validation and additional business logic

---

## Authentication

- **Firebase Auth** — Email/password sign-up and sign-in
- **User Isolation** — Each user's venues stored at `/users/{uid}/venues/`
- **Session Persistence** — Auth state saved across app launches

---

## Cross-Platform Sync

Changes sync instantly across platforms via Firestore real-time listeners:
- ✅ Add venue on iOS → appears on web
- ✅ Edit venue on web → updates on iOS immediately
- ✅ Delete venue on iOS → removes from web
- ✅ Upload photo on web → visible on iOS

---

## Testing Cross-Platform Changes

1. Add or edit a venue on iOS
2. Switch to the web app and refresh — changes appear instantly
3. Edit in the web app
4. Return to iOS — changes reflect immediately (no refresh needed)

---

## Known Limitations & TODOs

- [ ] Unit tests for cost calculations
- [ ] iPad-specific layouts
- [ ] VoiceOver accessibility labels
- [ ] Offline mode (Firestore persistence enabled but not fully tested)

---

## Related Projects

- [Web App](../web/README.md)
- [Backend API](../backend/README.md)
- [Android App](../android/README.md) (coming soon)

---

## Maintenance

**When updating the web app:**
- Schema changes → update `Venue.swift` model
- Cost calculation changes → update computed properties in `Venue.swift`
- Highlight/formatting logic changes → update `VenueUtils.swift`

Field names, cost formulas, and highlighting rules must remain identical across all platforms.

---

## License

UNLICENSED — Private project