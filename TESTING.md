# Testing Checklist - Wedding Venue Comparer

## Basic Functionality ✓

### Venue Management
- [ ] Can add new venue with name only
- [ ] Can add venue with all fields populated
- [ ] Can edit existing venue
- [ ] Can delete venue
- [ ] Venue appears in list after saving
- [ ] Search filters venues by name (case-insensitive)
- [ ] Sort by Total Cost works correctly
- [ ] Sort by Name works (alphabetical)
- [ ] Sort by Date Added works (newest first)

### Cost Calculations
- [ ] Venue rental cost displays correctly
- [ ] Catering per-person calculates: rate × guests + flat fee
- [ ] Bar service calculates: rate × guests + flat fee
- [ ] Coordinator fee adds to total
- [ ] Event insurance adds to total
- [ ] Other costs add to total
- [ ] Total cost displays in summary panel
- [ ] Per-guest cost calculates: total ÷ guests
- [ ] Live preview updates as you type
- [ ] All costs default to $0.00

### Animations
- [ ] Cost cards pulse blue when values change
- [ ] Summary panel glows when total changes
- [ ] Green pulse when name + cost entered (form complete)
- [ ] Smooth transitions on all updates

### Guest & Duration Sliders
- [ ] Guest slider moves smoothly (0-250)
- [ ] Duration slider moves smoothly (0-24 hours, 0.5 step)
- [ ] Badge values update in real-time
- [ ] Slider values sync when editing existing venue
- [ ] Changing guests updates catering/bar previews

### Photo Management
- [ ] Click "Browse Photos" opens file dialog
- [ ] Can select multiple photos at once
- [ ] Drag & drop zone accepts image files
- [ ] Drag & drop zone highlights on dragover
- [ ] Photos display as thumbnails
- [ ] Thumbnail hover effect works
- [ ] Click thumbnail to mark as title photo
- [ ] Title photo shows star icon (★)
- [ ] Title photo has blue border
- [ ] Remove button (✕) appears on thumbnails
- [ ] Click remove on new photo removes immediately
- [ ] Click remove on saved photo shows undo option
- [ ] Undo button reverses deletion (8 second timer)
- [ ] Photos save correctly when creating venue
- [ ] Photos save correctly when editing venue
- [ ] Photo count updates correctly

### Detail View
- [ ] Click venue card opens detail view
- [ ] Detail view shows all venue information
- [ ] Cost breakdown displays correctly
- [ ] Photos display in gallery grid
- [ ] Click photo opens lightbox
- [ ] Lightbox shows enlarged image
- [ ] Arrow buttons navigate photos
- [ ] Keyboard left/right arrows navigate
- [ ] Escape key closes lightbox
- [ ] Click outside lightbox closes it
- [ ] Close button works

### CSV Export
- [ ] Export CSV button creates file
- [ ] CSV includes all venue fields
- [ ] CSV has correct headers
- [ ] Calculated fields (total, per_guest) included
- [ ] Special characters in notes escaped properly
- [ ] File saves to user-selected location

## UI/UX Testing ✓

### Modal Behavior
- [ ] Modal opens when clicking "Add Venue"
- [ ] Modal opens when clicking existing venue
- [ ] Modal title changes to "Edit Venue" when editing
- [ ] Form resets when adding new venue
- [ ] Form populates with existing data when editing
- [ ] Cancel button closes modal without saving
- [ ] Click outside modal does NOT close (prevent accidents)
- [ ] Save button validates required fields
- [ ] Save button disabled until name entered
- [ ] Modal scrolls on small screens
- [ ] No horizontal overflow on any screen size

### Responsive Design
- [ ] Works on desktop (1200px+)
- [ ] Works on tablet (768-1200px)
- [ ] Works on mobile (320-767px)
- [ ] Form layout stacks on narrow screens
- [ ] Cost cards stack vertically when needed
- [ ] Summary panel remains visible
- [ ] Buttons don't overflow
- [ ] Text remains readable

### Accessibility
- [ ] All buttons have aria-labels
- [ ] Sliders have proper ARIA attributes
- [ ] Form inputs have labels
- [ ] Summary updates announced to screen readers (aria-live)
- [ ] Focus indicators visible on all interactive elements
- [ ] Tab order is logical
- [ ] Can operate entire app with keyboard only

### Visual Polish
- [ ] No layout jank on load
- [ ] Animations smooth (60fps)
- [ ] Colors consistent throughout
- [ ] Typography hierarchy clear
- [ ] Spacing consistent
- [ ] Hover states on all clickable items
- [ ] Loading states (if applicable)

## Edge Cases & Error Handling ✓

### Data Validation
- [ ] Cannot save venue without name
- [ ] Cannot enter negative costs
- [ ] Cannot enter negative guest count
- [ ] Cannot enter negative duration
- [ ] Decimal costs work correctly (pennies)
- [ ] Empty fields default to 0
- [ ] Very large numbers handled gracefully

### Photo Edge Cases
- [ ] Can add 0 photos
- [ ] Can add 50+ photos
- [ ] Large photo files (10MB+) upload correctly
- [ ] Invalid file types rejected
- [ ] Photos persist after app restart
- [ ] Deleting venue deletes its photos from disk
- [ ] Title photo persists correctly

### State Management
- [ ] Editing one venue doesn't affect others
- [ ] Deleting venue removes from list immediately
- [ ] Search updates instantly
- [ ] Sort persists during session
- [ ] No duplicate venues created

### Error Scenarios
- [ ] App handles missing database gracefully
- [ ] App handles corrupted venue data
- [ ] App handles missing photo files
- [ ] Delete photo fails gracefully if file missing
- [ ] Network errors (if any) show user-friendly messages

## Performance ✓

- [ ] List renders quickly with 100+ venues
- [ ] Search is instant
- [ ] Modal opens without delay
- [ ] Photo thumbnails load quickly
- [ ] No memory leaks after multiple CRUD operations
- [ ] App remains responsive during photo uploads

## Browser/Platform Compatibility ✓

- [ ] Works on macOS
- [ ] Works on Windows
- [ ] Works on Linux
- [ ] Electron version matches package.json
- [ ] No console errors in DevTools
- [ ] All dependencies installed correctly

---

## Known Issues

(Document any issues found during testing)

## Test Results Summary

**Date Tested:** ___________  
**Tester:** ___________  
**Pass Rate:** _____ / _____  
**Critical Issues:** _____  
**Minor Issues:** _____  

## Notes

(Additional observations or recommendations)
