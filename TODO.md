# Wedding Venue Comparer - TODO List

## Completed ✅

- [x] Implement Cost Cards + Live Calc
  - Replace modal inputs with visual cost cards, add sticky total summary, live update per-card subtotals and total.
- [x] Bar Service Toggle UI
  - Add toggle buttons for bar service type with live preview.
- [x] Sliders for Guests & Duration
  - Replace numeric inputs with sliders and badges.
- [x] Redesign modal to fit screen
  - Rework modal layout and CSS so it never causes horizontal scrolling and fits within viewport height.
- [x] Enforce non-negative numeric inputs
  - Ensure all numeric inputs/sliders cannot be set to negative values at UI and validation level.
- [x] Fix modal small-screen overflow
  - Adjust small-screen CSS (wrapping, min-widths, summary width, button sizes) to prevent margins from being clipped.
- [x] Add title photo option
  - Allow selecting/adding a title photo and store its relative path on venue record.
- [x] Preview uploaded photos when adding/editing
  - Show thumbnails for newly staged and existing photos in the modal.
- [x] Friendly detail view + clickable enlargements
  - Replace raw JSON with readable detail view and make photos clickable to enlarge in lightbox.
- [x] Choose title by thumbnail
  - Remove title-photo button; let users select title photo by clicking thumbnails.
- [x] Lightbox keyboard navigation
  - Support arrow-left/arrow-right and Esc to navigate and close enlarged gallery images.
- [x] Delete photo function
  - Allow removing an existing photo: delete DB record and file; update modal previews.
- [x] Verify delete-photo handler active
  - Restart the app to ensure `main.js` IPC handler 'delete-photo' is registered, then test delete flow in modal.
- [x] Catering/bar flat fee fields
  - Remove catering toggle, add flat fee fields for catering and bar; bar toggle only per person vs per hour.
- [x] Remove bar toggle entirely
  - Make bar service per-person only (like catering) with flat fee; remove toggle UI and logic.
- [x] Replace cost fields
  - Remove photography/flowers/music fields; add coordinator fee and event insurance in UI, logic, and DB.

## In Progress 🚧

(All current tasks completed!)

## Not Started 📋

- [ ] Tabbed Form Sections
  - Split modal into tabs: Basic, Costs, Photos & Notes. (User requested revert — now not-started)
- [ ] Cost Input Unit Toggle
  - Allow entering catering as per-person or total, with auto-conversion.
- [ ] Contextual Help Tooltips
  - Add tooltips for fields explaining cost categories.
- [ ] Preset Templates
  - Add quick-select templates for common venue types.
- [ ] Polish & Test
  - Test full modal flow, responsive behavior, and CSV export.

## Recent Changes (Feb 17, 2026)

- **Polish & Testing** - Cleaned console logs, added accessibility attributes, created testing checklist
- **Enhanced drag-and-drop photo zone** with hover effects, animations, and visual feedback
- **Animated cost highlights** - cards pulse when values change, summary glows on total update
- **Form completion animations** - green pulse when name + cost entered
- Replaced Photography/Flowers/Music fields with Coordinator Fee and Event Insurance
- Made bar service per-person only (removed per-hour toggle)
- Added flat fee fields for catering and bar service
- Fixed slider badge sync on modal open
- Added delete photo function with undo capability
- Improved form layout with labeled inputs
- Added star icon on title photo thumbnails

## Files to Review

- **TESTING.md** - Comprehensive testing checklist covering all features
- **TODO.md** - This file (project roadmap and completed features)
- **src/index.html** - Main UI with accessible form inputs
- **src/renderer.js** - Frontend logic with animations and photo management
- **src/styles.css** - Modern styling with responsive design and animations
- **src/db.js** - SQLite database layer
- **main.js** - Electron main process
- **preload.js** - IPC bridge

## Project Structure

```
wedding_venue_compare_tool_021526/
├── main.js              # Electron main process
├── preload.js           # Context bridge for IPC
├── package.json         # Dependencies
└── src/
    ├── index.html       # Main UI
    ├── renderer.js      # Frontend logic
    ├── styles.css       # Styling
    └── db.js            # SQLite database layer
```

## Database Schema

Current venue fields:
- id, name, guest_count, event_duration_hours
- venue_rental_cost
- catering_per_person, catering_flat_fee
- bar_service_type, bar_service_rate, bar_flat_fee
- coordinator_fee, event_insurance
- other_costs
- notes, title_photo, created_at

Photos table: id, venue_id, file_path, caption
