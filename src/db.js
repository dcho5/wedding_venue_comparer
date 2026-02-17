const Database = require('better-sqlite3');

class DB {
  constructor(dbPath) {
    this.db = new Database(dbPath);
  }

  init() {
    const createVenues = `
      CREATE TABLE IF NOT EXISTS venues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        guest_count INTEGER DEFAULT 0,
        event_duration_hours REAL DEFAULT 0,
        venue_rental_cost REAL DEFAULT 0,
        catering_per_person REAL DEFAULT 0,
        catering_flat_fee REAL DEFAULT 0,
        bar_service_type TEXT DEFAULT 'per_person',
        bar_service_rate REAL DEFAULT 0,
        bar_flat_fee REAL DEFAULT 0,
        coordinator_fee REAL DEFAULT 0,
        event_insurance REAL DEFAULT 0,
        other_costs REAL DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createPhotos = `
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venue_id INTEGER,
        file_path TEXT,
        caption TEXT,
        FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
      );
    `;

    this.db.exec(createVenues);
    this.db.exec(createPhotos);
    // ensure venues table has title_photo column for optional title image
    try {
      this.db.exec('ALTER TABLE venues ADD COLUMN title_photo TEXT');
    } catch (e) {
      // column likely already exists; ignore
    }
    // ensure catering_flat_fee and bar_flat_fee columns exist
    try { this.db.exec("ALTER TABLE venues ADD COLUMN catering_flat_fee REAL DEFAULT 0"); } catch (e) {}
    try { this.db.exec("ALTER TABLE venues ADD COLUMN bar_flat_fee REAL DEFAULT 0"); } catch (e) {}
    // ensure coordinator_fee and event_insurance columns exist
    try { this.db.exec("ALTER TABLE venues ADD COLUMN coordinator_fee REAL DEFAULT 0"); } catch (e) {}
    try { this.db.exec("ALTER TABLE venues ADD COLUMN event_insurance REAL DEFAULT 0"); } catch (e) {}
  }

  createVenue(v) {
    const stmt = this.db.prepare(`INSERT INTO venues (
      name, guest_count, event_duration_hours, venue_rental_cost,
      catering_per_person, catering_flat_fee, bar_service_type, bar_service_rate, bar_flat_fee,
      coordinator_fee, event_insurance, other_costs, notes, title_photo
    ) VALUES (@name,@guest_count,@event_duration_hours,@venue_rental_cost,@catering_per_person,@catering_flat_fee,@bar_service_type,@bar_service_rate,@bar_flat_fee,@coordinator_fee,@event_insurance,@other_costs,@notes,@title_photo)`);
    const params = {
      name: v.name || null,
      guest_count: v.guest_count || 0,
      event_duration_hours: v.event_duration_hours || 0,
      venue_rental_cost: v.venue_rental_cost || 0,
      catering_per_person: v.catering_per_person || 0,
      catering_flat_fee: v.catering_flat_fee || 0,
      bar_service_type: v.bar_service_type || 'per_person',
      bar_service_rate: v.bar_service_rate || 0,
      bar_flat_fee: v.bar_flat_fee || 0,
      coordinator_fee: v.coordinator_fee || 0,
      event_insurance: v.event_insurance || 0,
      other_costs: v.other_costs || 0,
      notes: v.notes || '',
      title_photo: v.title_photo || null
    };
    const info = stmt.run(params);
    return info.lastInsertRowid;
  }

  updateVenue(id, v) {
    const stmt = this.db.prepare(`UPDATE venues SET
      name=@name, guest_count=@guest_count, event_duration_hours=@event_duration_hours,
      venue_rental_cost=@venue_rental_cost, catering_per_person=@catering_per_person, catering_flat_fee=@catering_flat_fee,
      bar_service_type=@bar_service_type, bar_service_rate=@bar_service_rate, bar_flat_fee=@bar_flat_fee,
      coordinator_fee=@coordinator_fee, event_insurance=@event_insurance, other_costs=@other_costs, notes=@notes, title_photo=@title_photo
      WHERE id = @id`);
    const params = {
      id,
      name: v.name || null,
      guest_count: v.guest_count || 0,
      event_duration_hours: v.event_duration_hours || 0,
      venue_rental_cost: v.venue_rental_cost || 0,
      catering_per_person: v.catering_per_person || 0,
      catering_flat_fee: v.catering_flat_fee || 0,
      bar_service_type: v.bar_service_type || 'per_person',
      bar_service_rate: v.bar_service_rate || 0,
      bar_flat_fee: v.bar_flat_fee || 0,
      coordinator_fee: v.coordinator_fee || 0,
      event_insurance: v.event_insurance || 0,
      other_costs: v.other_costs || 0,
      notes: v.notes || '',
      title_photo: v.title_photo || null
    };
    const info = stmt.run(params);
    return info.changes;
  }

  deleteVenue(id) {
    const stmt = this.db.prepare('DELETE FROM venues WHERE id = ?');
    const info = stmt.run(id);
    return info.changes;
  }

  getVenues() {
    const stmt = this.db.prepare('SELECT * FROM venues ORDER BY created_at DESC');
    return stmt.all();
  }

  addPhoto(venueId, filePath, caption) {
    const stmt = this.db.prepare('INSERT INTO photos (venue_id, file_path, caption) VALUES (?,?,?)');
    const info = stmt.run(venueId, filePath, caption || '');
    return info.lastInsertRowid;
  }

  getPhotosForVenue(venueId) {
    const stmt = this.db.prepare('SELECT * FROM photos WHERE venue_id = ? ORDER BY id');
    return stmt.all(venueId);
  }

  getPhotoById(photoId) {
    const stmt = this.db.prepare('SELECT * FROM photos WHERE id = ?');
    return stmt.get(photoId);
  }

  getPhotoByPath(filePath) {
    const stmt = this.db.prepare('SELECT * FROM photos WHERE file_path = ?');
    return stmt.get(filePath);
  }

  deletePhoto(id) {
    const stmt = this.db.prepare('DELETE FROM photos WHERE id = ?');
    const info = stmt.run(id);
    return info.changes;
  }

  deletePhotoByPath(filePath) {
    const stmt = this.db.prepare('DELETE FROM photos WHERE file_path = ?');
    const info = stmt.run(filePath);
    return info.changes;
  }
}

module.exports = DB;
