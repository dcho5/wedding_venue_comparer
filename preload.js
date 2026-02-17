const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getVenues: () => ipcRenderer.invoke('get-venues'),
  createVenue: (venue) => ipcRenderer.invoke('create-venue', venue),
  updateVenue: (id, venue) => ipcRenderer.invoke('update-venue', id, venue),
  deleteVenue: (id) => ipcRenderer.invoke('delete-venue', id),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  addPhotos: (venueId, paths) => ipcRenderer.invoke('add-photos', venueId, paths),
  getPhotos: (venueId) => ipcRenderer.invoke('get-photos', venueId),
  exportCSV: (csvText) => ipcRenderer.invoke('export-csv', csvText),
  deletePhoto: (photoId) => ipcRenderer.invoke('delete-photo', photoId),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path')
});
