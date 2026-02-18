# Wedding Venue Comparer - Web Version

A browser-based version of the Wedding Venue Comparer app, built with React + Express + Firebase.

## Quick Start

1. **Set up Firebase** (see [SETUP_GUIDE.md](SETUP_GUIDE.md))
2. **Run setup script**: `bash setup.sh`
3. **Configure environment variables** in `.env` files
4. **Start backend**: `cd backend && npm run dev`
5. **Start frontend**: `cd frontend && npm start`

## Architecture

- **Frontend** (React): Modern SPA with responsive design
- **Backend** (Express): REST API with Firebase Admin SDK
- **Database**: Firestore (cloud-native, real-time)
- **Storage**: Firebase Storage (for photo uploads)
- **Auth**: Firebase Authentication

## Features

✅ User authentication (sign up/sign in)
✅ Add/edit/delete venues
✅ Cost calculations (venue, catering, bar, insurance, etc.)
✅ Multi-venue comparison (2-3 venues side-by-side)
✅ Photo uploads and gallery
✅ Search and sort by name, cost, or date
✅ Fully responsive (desktop, tablet, mobile)
✅ Cloud sync - all data persisted to Firestore

## Differences from Desktop Version

| Feature | Desktop (Electron) | Web (React) |
|---------|-------------------|-----------|
| Data Storage | Local SQLite | Cloud Firestore |
| Photos | Local filesystem | Firebase Storage |
| Deployment | Standalone executable | Browser-based |
| Offline Mode | Yes | No (requires internet) |
| Multi-device sync | No | Yes (automatic via cloud) |

## Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed Firebase and installation guide
- [API_REFERENCE.md](API_REFERENCE.md) - Backend API endpoints

## Project Structure

```
web/
├── backend/
│   ├── server.js              # Express + Firebase server
│   ├── package.json           # Backend dependencies
│   ├── .env.example           # Environment template
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── index.js           # React entry point
│   │   ├── App.js             # Main app
│   │   ├── Auth.js            # Login/signup
│   │   ├── VenueList.js       # Venue cards
│   │   ├── VenueForm.js       # Add/edit form
│   │   ├── VenueComparison.js # Comparison view
│   │   ├── api.js             # API client
│   │   ├── firebaseConfig.js  # Firebase config
│   │   ├── styles.css         # Styling
│   │   └── ...
│   ├── public/
│   ├── package.json           # Frontend dependencies
│   ├── .env.example           # Environment template
│   └── ...
├── SETUP_GUIDE.md             # Installation guide
├── API_REFERENCE.md           # API docs
├── setup.sh                   # Quick setup script
└── .gitignore
```

## Firebase Setup Requirements

1. Create Firebase project (free tier)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database (test mode)
4. Enable Cloud Storage
5. Generate service account credentials
6. Fill in `.env` files with credentials

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for step-by-step instructions.

## Deployment

### Backend
Deploy to Heroku, AWS, Google Cloud, or any Node.js hosting:
```bash
cd backend
heroku create your-app
git push heroku main
```

### Frontend
Deploy to Vercel, Netlify, Firebase Hosting, or GitHub Pages:
```bash
cd frontend
npm run build
# Deploy build folder to your hosting provider
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Firebase Firestore free tier: 50,000 reads/writes per day
- Storage: 1 GB free per month
- Bandwidth: 1 GB/month free
- Ideal for personal/small-scale use

For heavier usage, upgrade Firebase plan.

## Future Enhancements

- [ ] Guest list management
- [ ] Budget alerts and tracking
- [ ] CSV export/import
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Offline mode with sync
- [ ] Collaborative editing (multiple users per account)
- [ ] Admin dashboard for analytics
