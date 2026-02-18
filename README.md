# Wedding Venue Comparer 💍

A modern web application for comparing wedding venues with cost breakdowns, photo galleries, and responsive design for desktop and mobile.

**Live Demo:** https://dcho5.github.io/wedding_venue_comparer/

## Quick Start

### Frontend (React)
```bash
cd frontend
npm install
npm start          # Dev server on http://localhost:3000
npm run deploy     # Deploy to GitHub Pages
```

### Backend (Express)
```bash
cd backend
npm install
node server.js     # API server on http://localhost:5001
```

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

- **Frontend:** React 18, Firebase SDK (Auth, Storage), Axios
- **Backend:** Express, Firebase Admin SDK, Firestore
- **Database:** Cloud Firestore
- **Storage:** Firebase Storage
- **Deployment:** GitHub Pages (frontend), Render (backend)

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
└── README.md
```

## Deployment

### Frontend (GitHub Pages)
Already deployed at: https://dcho5.github.io/wedding_venue_comparer/

```bash
cd web/frontend
npmfrontend
npm run deploy
```

### Backend (Render)
1. Go to [render.com](https://render.com)
2. Create new Web Service from GitHub repository
3. Settings:
   - **Root Directory:** `backend`
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

## License

UNLICENSED - Private project
