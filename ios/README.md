# Wedding Venue Comparer - iOS App

A native iOS application for comparing wedding venues, built with **SwiftUI** and **Swift 6.0+**.

> **TestFlight:** Coming soon. Release status and updates will be posted here.

## Features ✨

- **Real-time Sync** with web app (Firestore)
- **Venue Management** - Add, edit, delete venues
- **Cost Breakdown** - Automatic calculations
- **Photo Gallery** - Upload and manage venue photos
- **Smart Comparison** - Side-by-side venue metrics with highlighting
- **Firebase Auth** - Secure login/signup
- **Offline Support** - Firestore offline persistence

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
│   └── HighlightUtils.swift
├── AppDelegate.swift
└── WeddingVenueComparerApp.swift
```

## Setup

### 1. Prerequisites
- Xcode 15+ with iOS 15+ support
- CocoaPods or Swift Package Manager
- Firebase account (using existing `wedding-venue-comparer` project)

### 2. Install Dependencies
Add via Swift Package Manager in Xcode:
- `firebase-ios-sdk` (FirebaseAuth, FirebaseFirestore, FirebaseStorage)
- Or use CocoaPods: `pod install`

### 3. Firebase Configuration
1. Download `GoogleService-Info.plist` from Firebase Console:
   - Go to Project Settings → iOS app → Download plist
2. Add to Xcode project (ensure "Copy items if needed" is checked)
3. Verify bundle ID matches Firebase project setup

### 4. Run
```bash
open WeddingVenueComparer.xcodeproj
# Select WeddingVenueComparer scheme
# Build and run on simulator or device
```

## Shared Data Model

All fields match the web version exactly (snake_case in Firestore):

```swift
struct Venue {
    var id: String
    var name: String
    var guest_count: Int
    var event_duration_hours: Int
    var venue_rental_cost: Double
    var catering_per_person: Double
    var catering_flat_fee: Double
    var bar_per_person: Double
    var bar_flat_fee: Double
    var coordinator_fee: Double
    var event_insurance: Double
    var other_costs: Double
    var notes: String
    var photos: [VenuePhoto]
    var created_at: Timestamp
    var updated_at: Timestamp
}
```

## Backend Integration

The app uses **two strategies** simultaneously:

1. **Firebase Realtime Sync** (Primary)
   - Firestore for data storage
   - Firebase Storage for photos
   - Real-time listeners for instant updates

2. **REST API** (Optional, via APIService)
   - Backend URL: `https://wedding-venue-backend-dpe3ejr2ja-uc.a.run.app/api`
   - Used for validation and additional business logic if needed

## Cross-Platform Sync

Changes are **instantly reflected** across platforms:
- ✅ Add venue on iOS → appears on web
- ✅ Edit venue on web → updates on iOS
- ✅ Delete venue on iOS → removes from web
- ✅ Upload photo on web → visible on iOS

Powered by Firestore real-time listeners and shared database schema.

## Cost Calculation

Matches web app exactly:

```
Total = Venue Rental 
      + (Catering Rate × Guests + Catering Flat Fee)
      + (Bar Rate × Guests + Bar Flat Fee)
      + Coordinator Fee + Event Insurance + Other Costs

Per Guest = Total ÷ Guest Count
```

Implemented in `Venue.swift` computed properties.

## Highlighting Logic

Ported from web `highlightUtils.js` to Swift in `HighlightUtils.swift`:
- 🟢 **Green** = Best value (lowest for costs)
- 🔴 **Red** = Worst value (highest for costs)
- ⚫ **Grey** = All values equal or neutral

## Authentication

- **Firebase Auth** - Email/password sign-up and sign-in
- **User Isolation** - Each user's venues in `/users/{uid}/venues` subcollection
- **Session Persistence** - Auth state saved across app launches

## Testing Cross-Platform Changes

1. Make a change on iOS (e.g., add venue)
2. Switch to web app in browser
3. Refresh - changes appear instantly (Firestore real-time)
4. Edit in web app
5. Return to iOS - changes reflect immediately

## Known Limitations & TODOs

- [ ] Photo upload UI (PHPickerViewController integration)
- [ ] Offline mode (Firestore persistence enabled but not fully tested)
- [ ] Unit tests for cost calculations
- [ ] Dark mode support
- [ ] iPad-specific layouts
- [ ] VoiceOver accessibility labels

## Related Projects

- **Web App**: `../frontend/` (React)
- **Backend API**: `../backend/` (Express)
- **Android App**: `../android/` (Coming soon)

## Maintenance

**When updating the web app:**
- If Firestore schema changes → update `Venue.swift` model
- If cost calculation changes → update `Venue.swift` computed properties
- If highlighting logic changes → update `HighlightUtils.swift`

**Keep iOS and web in sync:**
- Field names must match exactly (snake_case)
- Cost formulas must be identical
- Highlighting rules must be identical

## License

UNLICENSED - Private project
