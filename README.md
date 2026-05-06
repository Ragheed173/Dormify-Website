# Dormify

Dormify is a student housing platform with a React frontend and an Express/MySQL backend. The backend is structured around the main use cases: students browse and book housing, owners manage their listings and booking requests, and admins manage platform data.

## Backend Readiness

- Authentication: JWT login/register plus Google OAuth.
- Authorization: role middleware protects `student`, `owner`, and `admin` routes.
- Validation: reusable request validation for params, query strings, and request bodies.
- Error handling: centralized error middleware returns consistent `message`, `code`, and validation `details`.
- Documentation: OpenAPI/Swagger is available at `http://localhost:5000/api-docs`.
- Code structure: routes call controllers, controllers focus on use cases, and shared booking status logic lives in `server/services/bookingService.js`.
- Database sync: `DB_SYNC_ALTER=true` can be used during development when schema changes need to be applied automatically.

## Main Use Cases

1. Student registers or logs in and receives a JWT.
2. Student browses public housing listings with search/filter/pagination.
3. Student creates a pending booking for an available housing.
4. Owner logs in and creates, updates, or deletes only their own housings.
5. Owner reviews booking requests for their own housings and confirms, rejects, or cancels them.
6. Admin manages users, housings, bookings, and dashboard statistics.

## Important Backend Rules

- Public registration allows `student` and `owner`; admin accounts should be created by an existing admin or directly in the database for setup.
- Only students can create bookings through `/api/bookings`.
- Owners can update booking status only for bookings connected to their own housings.
- Admins can update or delete bookings through admin/general booking routes.
- Confirming a booking decreases `available_rooms`; cancelling/rejecting a confirmed booking restores one room.

## Run Locally

1. Copy `.env.example` to `.env`.
2. Start MySQL/XAMPP and create the configured database.
3. Install dependencies with `npm install`.
4. Start the backend with `npm run backend`.
5. Start the frontend in another terminal with `npm run frontend`.

Backend URL: `http://localhost:5000`

Frontend URL: `http://localhost:5173`

Swagger URL: `http://localhost:5000/api-docs`
