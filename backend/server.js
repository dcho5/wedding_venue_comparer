require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Firebase Admin Setup
const hasServiceAccount =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_PRIVATE_KEY &&
  !!process.env.FIREBASE_CLIENT_EMAIL;

const credential = hasServiceAccount
  ? admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  : admin.credential.applicationDefault();

admin.initializeApp({
  credential,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  databaseURL: process.env.FIREBASE_PROJECT_ID
    ? `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    : undefined
});

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

// Multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ============ AUTH ROUTES ============

// Sign up
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

// Verify ID token (frontend sends this after Firebase auth)
app.post('/api/auth/verify', async (req, res) => {
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

// ============ VENUE ROUTES ============

// Get all venues for user
app.get('/api/venues', async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const snapshot = await db.collection('users').doc(uid).collection('venues').get();
    const venues = [];
    snapshot.forEach(doc => {
      venues.push({ id: doc.id, ...doc.data() });
    });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create venue
app.post('/api/venues', async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const venue = {
      ...req.body,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('users').doc(uid).collection('venues').add(venue);
    const doc = await docRef.get();
    res.json({ id: docRef.id, ...doc.data() });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update venue
app.put('/api/venues/:venueId', async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const { venueId } = req.params;
    const updates = {
      ...req.body,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(uid).collection('venues').doc(venueId).update(updates);
    res.json({ id: venueId, ...updates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete venue
app.delete('/api/venues/:venueId', async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const { venueId } = req.params;

    // Delete all photos for this venue (both Firestore records and Storage files)
    const photosSnapshot = await db.collection('users').doc(uid).collection('venues').doc(venueId).collection('photos').get();
    const batch = db.batch();
    const deletePromises = [];
    
    photosSnapshot.forEach(doc => {
      const photoData = doc.data();
      // Delete from Firestore
      batch.delete(doc.ref);
      // Delete from Storage
      if (photoData.file_path) {
        const fileRef = storage.bucket().file(photoData.file_path);
        deletePromises.push(fileRef.delete().catch(err => console.error('Error deleting file:', err)));
      }
    });
    
    await batch.commit();
    await Promise.all(deletePromises);

    // Delete venue
    await db.collection('users').doc(uid).collection('venues').doc(venueId).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PHOTO ROUTES ============

// Upload photo
app.post('/api/venues/:venueId/photos', upload.single('file'), async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const { venueId } = req.params;
    const filename = `${uid}/venues/${venueId}/${Date.now()}-${req.file.originalname}`;

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const file = bucket.file(filename);
    await file.save(req.file.buffer, { metadata: { contentType: req.file.mimetype } });

    // Create signed URL for retrieval
    const [url] = await file.getSignedUrl({ version: 'v4', action: 'read', expires: Date.now() + 7 * 24 * 60 * 60 * 1000 });

    // Save photo metadata to Firestore
    const photoDoc = await db
      .collection('users')
      .doc(uid)
      .collection('venues')
      .doc(venueId)
      .collection('photos')
      .add({
        file_path: filename,
        url: url,
        caption: req.body.caption || '',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({ id: photoDoc.id, file_path: filename, url, caption: req.body.caption || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get photos for venue
app.get('/api/venues/:venueId/photos', async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const { venueId } = req.params;
    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection('venues')
      .doc(venueId)
      .collection('photos')
      .get();

    const photos = [];
    snapshot.forEach(doc => {
      photos.push({ id: doc.id, ...doc.data() });
    });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete photo
app.delete('/api/venues/:venueId/photos/:photoId', async (req, res) => {
  try {
    const uid = req.headers['x-user-id'];
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const { venueId, photoId } = req.params;
    const photoDoc = await db
      .collection('users')
      .doc(uid)
      .collection('venues')
      .doc(venueId)
      .collection('photos')
      .doc(photoId)
      .get();

    if (photoDoc.exists) {
      const filePath = photoDoc.data().file_path;
      // Delete from storage
      await storage.bucket().file(filePath).delete();
      // Delete from Firestore
      await photoDoc.ref.delete();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Also accessible at http://192.168.1.146:${PORT}`);
});
