# Backend API Reference

## Base URL
`http://localhost:5000/api`

## Authentication
All requests (except auth endpoints) must include:
- Header: `x-user-id: {uid}` (user's Firebase UID)

## Endpoints

### Authentication

#### POST /auth/signup
Create new user account
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/verify
Verify Firebase ID token
```json
{
  "idToken": "firebase-id-token"
}
```

### Venues

#### GET /venues
Get all venues for authenticated user
```
Headers: x-user-id: {uid}
```

#### POST /venues
Create new venue
```json
{
  "name": "Grand Ballroom",
  "guest_count": 150,
  "event_duration_hours": 5,
  "venue_rental_cost": 5000,
  "catering_per_person": 45,
  "catering_flat_fee": 500,
  "bar_service_rate": 8,
  "bar_flat_fee": 200,
  "coordinator_fee": 1000,
  "event_insurance": 300,
  "other_costs": 200,
  "notes": "Beautiful venue"
}
```

#### PUT /venues/:venueId
Update existing venue
```json
{
  "name": "Updated Name",
  "guest_count": 200
  // ... other fields to update
}
```

#### DELETE /venues/:venueId
Delete venue and all associated photos

### Photos

#### POST /venues/:venueId/photos
Upload photo for venue
```
Content-Type: multipart/form-data
Body:
  - file: image file
  - caption: optional photo caption
```

#### GET /venues/:venueId/photos
Get all photos for venue

#### DELETE /venues/:venueId/photos/:photoId
Delete specific photo

## Data Model

### Venue
```javascript
{
  id: string,
  name: string,
  guest_count: number,
  event_duration_hours: number,
  venue_rental_cost: number,
  catering_per_person: number,
  catering_flat_fee: number,
  bar_service_rate: number,
  bar_flat_fee: number,
  coordinator_fee: number,
  event_insurance: number,
  other_costs: number,
  notes: string,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Photo
```javascript
{
  id: string,
  file_path: string,
  url: string,
  caption: string,
  created_at: timestamp
}
```

## Error Responses

All errors return:
```json
{
  "error": "Error message"
}
```

Common status codes:
- 400: Bad request (missing fields)
- 401: Unauthorized (missing token)
- 500: Server error
