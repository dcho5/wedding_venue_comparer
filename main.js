const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const DB = require('./src/db');

let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(() => {
  const userData = app.getPath('userData');
  const photosDir = path.join(userData, 'venue-photos');
  if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });

  const dbPath = path.join(userData, 'venues.db');
  db = new DB(dbPath);
  db.init();

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('get-venues', async () => {
  return db.getVenues();
});

ipcMain.handle('create-venue', async (event, venue) => {
  return db.createVenue(venue);
});

ipcMain.handle('update-venue', async (event, id, venue) => {
  return db.updateVenue(id, venue);
});

ipcMain.handle('delete-venue', async (event, id) => {
  // delete photos for venue
  const photos = db.getPhotosForVenue(id);
  const userData = app.getPath('userData');
  for (const p of photos) {
    const abs = path.join(userData, p.file_path);
    try { fs.unlinkSync(abs); } catch (e) {}
    db.deletePhoto(p.id);
  }
  return db.deleteVenue(id);
});

ipcMain.handle('open-file-dialog', async (event) => {
  const res = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }]
  });
  if (res.canceled) return [];
  return res.filePaths;
});

ipcMain.handle('get-user-data-path', async () => {
  return app.getPath('userData');
});

ipcMain.handle('add-photos', async (event, venueId, paths) => {
  const userData = app.getPath('userData');
  const photosDir = path.join(userData, 'venue-photos');
  const added = [];
  for (const item of paths) {
    // item can be a string path or an object { path, tempId }
    const original = (typeof item === 'string') ? item : item.path;
    const tempId = (typeof item === 'object' && item.tempId !== undefined) ? item.tempId : undefined;
    const ext = path.extname(original);
    const name = `${Date.now()}-${path.basename(original)}`;
    const destRel = path.join('venue-photos', name);
    const dest = path.join(userData, destRel);
    try {
      fs.copyFileSync(original, dest);
      const photoId = db.addPhoto(venueId, destRel, '');
      const out = { id: photoId, file_path: destRel };
      if (tempId !== undefined) out.tempId = tempId;
      added.push(out);
    } catch (e) {
      console.error('copy failed', e);
    }
  }
  return added;
});

ipcMain.handle('get-photos', async (event, venueId) => {
  return db.getPhotosForVenue(venueId);
});

ipcMain.handle('export-csv', async (event, csvText) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Export CSV',
    defaultPath: 'venues.csv',
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  });
  if (filePath) {
    fs.writeFileSync(filePath, csvText, 'utf8');
    return { success: true, filePath };
  }
  return { success: false };
});

ipcMain.handle('delete-photo', async (event, payload) => {
  try {
    // payload may be a numeric id, or an object { id, file_path }
    let photo = null;
    if (payload && typeof payload === 'object') {
      if (payload.id !== undefined && payload.id !== null) photo = db.getPhotoById(payload.id);
      if (!photo && payload.file_path) photo = db.getPhotoByPath(payload.file_path);
    } else {
      // numeric id passed directly
      photo = db.getPhotoById(payload);
    }

    const userData = app.getPath('userData');

    if (photo) {
      const abs = path.join(userData, photo.file_path);
      try { fs.unlinkSync(abs); } catch (e) { /* ignore */ }
      const changes = db.deletePhoto(photo.id);
      return { success: changes > 0 };
    }

    // Photo record not found; attempt best-effort delete by provided file_path
    if (payload && typeof payload === 'object' && payload.file_path) {
      const abs2 = path.join(userData, payload.file_path);
      try { fs.unlinkSync(abs2); } catch (e) { /* ignore */ }
      const changes2 = db.deletePhotoByPath(payload.file_path);
      return { success: changes2 > 0 };
    }

    return { success: false, message: 'not found' };
  } catch (e) {
    console.error('delete-photo failed', e);
    return { success: false, message: String(e) };
  }
});
