const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Firebase Admin
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
});

const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

// ============ AUTHENTICATION ENDPOINTS ============

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const userRecord = await auth.createUser({ email, password });
    res.json({ uid: userRecord.uid, email: userRecord.email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login (client-side; this endpoint returns user info after client auth token)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'ID token required' });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    res.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get current user info
app.get('/api/auth/me', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'No token' });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    res.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============ VENUES ENDPOINTS ============

// Get all venues for user
app.get('/api/venues', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(401).json({ error: 'Not authenticated' });
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const snapshot = await db.collection('users')
      .doc(userId)
      .collection('venues')
      .orderBy('created_at', 'desc')
      .get();

    const venues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(venues);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create venue
app.post('/api/venues', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(401).json({ error: 'Not authenticated' });
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const venueData = req.body;
    venueData.created_at = admin.firestore.Timestamp.now();
    venueData.updated_at = admin.firestore.Timestamp.now();

    const docRef = await db.collection('users')
      .doc(userId)
      .collection('venues')
      .add(venueData);

    res.json({ id: docRef.id, ...venueData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update venue
app.put('/api/venues/:id', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(401).json({ error: 'Not authenticated' });
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { id } = req.params;

    const venueData = req.body;
    venueData.updated_at = admin.firestore.Timestamp.now();

    await db.collection('users')
      .doc(userId)
      .collection('venues')
      .doc(id)
      .update(venueData);

    res.json({ id, ...venueData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete venue
app.delete('/api/venues/:id', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(401).json({ error: 'Not authenticated' });
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { id } = req.params;

    // Delete all photos for this venue first
    const photosSnapshot = await db.collection('users')
      .doc(userId)
      .collection('venues')
      .doc(id)
      .collection('photos')
      .get();

    for (const photoDoc of photosSnapshot.docs) {
      const photoData = photoDoc.data();
      if (photoData.storage_path) {
        try {
          await bucket.file(photoData.storage_path).delete();
        } catch (e) {
          console.log('Photo file not found, skipping:', photoData.storage_path);
        }
      }
      await photoDoc.ref.delete();
    }

    // Delete venue
    await db.collection('users')
      .doc(userId)
      .collection('venues')
      .doc(id)
      .delete();

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ PHOTOS ENDPOINTS ============

// Get photos for venue
app.get('/api/venues/:venueId/photos', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(401).json({ error: 'Not authenticated' });
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { venueId } = req.params;

    const snapshot = await db.collection('users')
      .doc(userId)
      .collection('venues')
      .doc(venueId)
      .collection('photos')
      .get();

    const photos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(photos);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload photo
app.post('/api/venues/:venueId/photos', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(401).json({ error: 'Not authenticated' });
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { venueId } = req.params;
    const { file_data, file_name, caption } = req.body;

    if (!file_data) {
      return res.status(400).json({ error: 'file_data required' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const storagePath = `users/${userId}/venues/${venueId}/${timestamp}-${file_name}`;

    // Decode base64 and upload
    const buffer = Buffer.from(file_data.split(',')[1], 'base64');
    const file = bucket.file(storagePath);

    await file.save(buffer, {
      metadata: { contentType: 'image/jpeg' }
    });

    // Get signed URL (valid for 1 year)
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000
    });

    // Save photo metadata to Firestore
    const photoData = {
      caption: caption || '',
      storage_path: storagePath,
      url: url,
      created_at: admin.firestore.Timestamp.now()
    };

    const docRef = await db.collection('users')
      .doc(userId)
      .collection('venues')
      .doc(venueId)
      .collection('photos')
      .add(photoData);

    res.json({ id: docRef.id, ...photoData });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete photo
app.delete('/api/venues/:venueId/photos/:photoId', async (req, res) => {
  try {
    const idToken = req.headers.authorization?.split(' ')[1];
    if (!idToken) return res.status(401).json({ error: 'Not authenticated' });
    
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { venueId, photoId } = req.params;

    const photoRef = db.collection('users')
      .doc(userId)
      .collection('venues')
      .doc(venueId)
      .collection('photos')
      .doc(photoId);

    const photoDoc = await photoRef.get();
    const photoData = photoDoc.data();

    // Delete from storage if path exists
    if (photoData?.storage_path) {
      try {
        await bucket.file(photoData.storage_path).delete();
      } catch (e) {
        console.log('Photo file not found:', photoData.storage_path);
      }
    }

    // Delete from Firestore
    await photoRef.delete();

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
