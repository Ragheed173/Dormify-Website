/**
 * @swagger
 * /:
 *   get:
 *     summary: Check that the backend is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Backend status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiMessage"
 *
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterRequest"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Invalid input or email already exists
 *       500:
 *         description: Register failed
 *
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginRequest"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 *
 * /api/auth/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth
 *
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to the frontend auth success or login page
 *
 * /api/home/stats:
 *   get:
 *     summary: Get public homepage stats
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     usersCount:
 *                       type: integer
 *                     housingsCount:
 *                       type: integer
 *                     bookingsCount:
 *                       type: integer
 *       500:
 *         description: Failed to fetch stats
 *
 * /api/home/featured-housings:
 *   get:
 *     summary: Get featured available housings
 *     tags: [Home]
 *     responses:
 *       200:
 *         description: Featured housings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Housing"
 *       500:
 *         description: Failed to fetch featured housings
 *
 * /api/housings:
 *   get:
 *     summary: Get public housing listings
 *     tags: [Housings]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or location
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: gender_allowed
 *         schema:
 *           type: string
 *           enum: [male, female, both]
 *       - in: query
 *         name: room_type
 *         schema:
 *           type: string
 *           enum: [single, double, triple]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, unavailable]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Housings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Housing"
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Failed to fetch housings
 *
 * /api/housings/{id}:
 *   get:
 *     summary: Get a housing listing by ID
 *     tags: [Housings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Housing fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: "#/components/schemas/Housing"
 *       404:
 *         description: Housing not found
 *       500:
 *         description: Failed to fetch housing
 *
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/BookingRequest"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: "#/components/schemas/Booking"
 *       400:
 *         description: Missing fields or housing unavailable
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Housing not found
 *       500:
 *         description: Failed to create booking
 *
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: "#/components/schemas/Booking"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Failed to fetch booking
 *   delete:
 *     summary: Delete a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Failed to delete booking
 *
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update a booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/BookingStatusRequest"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: "#/components/schemas/Booking"
 *       400:
 *         description: Invalid status or no rooms available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking or housing not found
 *       500:
 *         description: Failed to update booking status
 *
 * /api/student/profile:
 *   get:
 *     summary: Get the logged-in student profile
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: "#/components/schemas/User"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch profile
 *   put:
 *     summary: Update the logged-in student profile
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProfileUpdateRequest"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Email is already in use
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update profile
 *
 * /api/student/bookings:
 *   get:
 *     summary: Get bookings for the logged-in student
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/Booking"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch bookings
 *
 * /api/student/bookings/{id}:
 *   get:
 *     summary: Get one student booking
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found or does not belong to this student
 *       500:
 *         description: Failed to fetch booking
 *
 * /api/student/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel one student booking
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Booking is already cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found or does not belong to this student
 *       500:
 *         description: Failed to cancel booking
 *
 * /api/owner/profile:
 *   get:
 *     summary: Get the logged-in owner profile
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Owner profile fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Owner not found
 *       500:
 *         description: Failed to fetch owner profile
 *   put:
 *     summary: Update the logged-in owner profile
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProfileUpdateRequest"
 *     responses:
 *       200:
 *         description: Owner profile updated successfully
 *       400:
 *         description: Email is already in use
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Owner not found
 *       500:
 *         description: Failed to update owner profile
 *
 * /api/owner/housings:
 *   get:
 *     summary: Get housings created by the logged-in owner
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Owner housings fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch owner housings
 *   post:
 *     summary: Create a housing as the logged-in owner
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/HousingRequest"
 *     responses:
 *       201:
 *         description: Housing created successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to create housing
 *
 * /api/owner/housings/{id}:
 *   put:
 *     summary: Update an owner housing
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/HousingRequest"
 *     responses:
 *       200:
 *         description: Housing updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Housing not found or does not belong to this owner
 *       500:
 *         description: Failed to update housing
 *   delete:
 *     summary: Delete an owner housing
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Housing deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Housing not found or does not belong to this owner
 *       500:
 *         description: Failed to delete housing
 *
 * /api/owner/bookings:
 *   get:
 *     summary: Get bookings for the logged-in owner's housings
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Owner bookings fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch owner bookings
 *
 * /api/owner/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status as owner
 *     tags: [Owner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/OwnerBookingStatusRequest"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       400:
 *         description: Invalid status or no rooms available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking or housing not found
 *       500:
 *         description: Failed to update booking status
 *
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch dashboard stats
 *
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch users
 *
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get one user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user
 *   put:
 *     summary: Update one user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserUpdateRequest"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Email is already in use
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user
 *   delete:
 *     summary: Delete one user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete user
 *
 * /api/admin/housings:
 *   post:
 *     summary: Create a housing as admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/HousingRequest"
 *     responses:
 *       201:
 *         description: Housing created successfully
 *       400:
 *         description: Required fields are missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to create housing
 *
 * /api/admin/housings/{id}:
 *   put:
 *     summary: Update a housing as admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/HousingRequest"
 *     responses:
 *       200:
 *         description: Housing updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Housing not found
 *       500:
 *         description: Failed to update housing
 *   delete:
 *     summary: Delete a housing as admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Housing deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Housing not found
 *       500:
 *         description: Failed to delete housing
 *
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings as admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to fetch bookings
 *
 * /api/admin/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status as admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/BookingStatusRequest"
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       400:
 *         description: Invalid status or no rooms available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking or housing not found
 *       500:
 *         description: Failed to update booking status
 */
