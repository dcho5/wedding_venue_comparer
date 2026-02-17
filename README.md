# Wedding Venue Comparer 💍

A modern Electron desktop application for comparing wedding venues with cost breakdowns, photo galleries, and CSV export capabilities.

## Quick Start

```bash
# Install dependencies
npm install

# Run the app
npm start
```

## Features ✨

### Cost Management
- **Visual Cost Cards** - Intuitive cards for each cost category with live calculations
- **Animated Feedback** - Visual confirmation when costs change
- **Flexible Pricing** - Per-person rates + flat fees for catering and bar service
- **Categories:** Venue Rental, Catering, Bar Service, Coordinator Fee, Event Insurance, Other Costs

### Photo Management
- **Drag & Drop** - Drag photos directly into the app
- **Thumbnail Gallery** - Visual preview with title photo selection
- **Delete with Undo** - 8-second undo window for photo deletions
- **Lightbox View** - Full-screen photo viewer with keyboard navigation (← → Esc)

### Venue Organization
- **Search** - Filter venues by name (instant)
- **Sort** - By total cost, name, or date added
- **CSV Export** - Export all venues for external analysis
- **Detail View** - Comprehensive breakdown with photo gallery

## Technology Stack

- **Electron** - Cross-platform desktop framework
- **SQLite (better-sqlite3)** - Fast, embedded database
- **Vanilla JavaScript** - Lightweight and fast
- **Modern CSS** - Responsive design with animations

## Data Storage

- **Database:** `userData/venues.db`
- **Photos:** `userData/venue-photos/`

Data is stored in the platform-specific `userData` folder:
- macOS: `~/Library/Application Support/wedding-venue-comparer/`
- Windows: `%APPDATA%/wedding-venue-comparer/`
- Linux: `~/.config/wedding-venue-comparer/`

## Usage Guide

### Adding a Venue
1. Click "Add Venue"
2. Enter name (required), adjust guests & duration sliders
3. Fill cost details, add photos via drag-drop or browse
4. Click any photo to mark as title
5. Save

### Cost Calculation
```
Total = Venue Rental 
      + (Catering Rate × Guests + Catering Flat Fee)
      + (Bar Rate × Guests + Bar Flat Fee)
      + Coordinator Fee + Event Insurance + Other Costs

Per Guest = Total ÷ Guest Count
```

### Keyboard Shortcuts
- **Esc** - Close modal/lightbox
- **← →** - Navigate photos in lightbox
- **Tab** - Navigate form fields

## Project Files

- **[TODO.md](TODO.md)** - Project roadmap and completed features
- **[TESTING.md](TESTING.md)** - Comprehensive testing checklist
- **src/index.html** - UI structure with accessible forms
- **src/renderer.js** - Frontend logic with animations
- **src/styles.css** - Responsive styling
- **src/db.js** - SQLite database layer
- **main.js** - Electron main process
- **preload.js** - IPC bridge

## Troubleshooting

**Photos not showing?** Restart app after main.js changes  
**Delete not working?** Check console for IPC errors  
**Modal issues?** Verify DOM loaded before accessing elements

**Debug Mode:** Open DevTools with Cmd+Option+I (Mac) or Ctrl+Shift+I (Windows/Linux)

## License

MIT - Use freely for your wedding planning! 💒
