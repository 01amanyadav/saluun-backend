# Saluun - Salon Booking Platform Backend

A comprehensive REST API for a salon booking platform built with Node.js, Express, and PostgreSQL.

## Features

✅ **User Management**
- User registration and authentication with JWT
- User profile management
- Role-based access control (Customer, Salon Owner, Admin)

✅ **Salon Management**
- Salon profile creation and management
- Service management per salon
- Search and filter functionality
- Location-based discovery

✅ **Appointment Booking**
- Browse available time slots
- Book appointments
- Cancel and reschedule bookings
- Prevent double-booking

✅ **Ratings & Reviews**
- Rate salons after service completion
- View salon ratings and reviews
- Update or delete ratings

✅ **Salon Owner Dashboard**
- View all bookings
- Track analytics and revenue
- Manage services and availability
- Daily and monthly statistics

✅ **Advanced Features**
- Time slot management
- Booking status tracking
- Reschedule history
- Revenue analytics

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd saluun_backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create PostgreSQL Database
```bash
createdb saluun
```

### 4. Setup Database Tables
```bash
psql saluun < database/setup.sql
```

### 5. Create .env File
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/saluun
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

### 6. Start the Server

**Development mode (with nodemon):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## Project Structure

```
saluun_backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── bookingController.js  # Booking operations
│   ├── ownerController.js    # Owner dashboard & analytics
│   ├── ratingController.js   # Rating operations
│   ├── serviceController.js  # Service management
│   ├── shopController.js     # Salon management
│   └── userController.js     # User profile
├── database/
│   └── setup.sql            # Database schema
├── middleware/
│   ├── adminMiddleware.js   # Admin authorization
│   ├── authMiddleware.js    # JWT authentication
│   └── errorMiddleware.js   # Global error handling
├── models/
│   ├── analyticsModel.js    # Analytics queries
│   ├── Booking.js           # Booking queries
│   ├── ratingModel.js       # Rating queries
│   ├── rescheduleModel.js   # Reschedule history
│   ├── serviceModel.js      # Service queries
│   ├── shopModel.js         # Salon queries
│   ├── timeSlotModel.js     # Time slot queries
│   └── userModel.js         # User queries
├── routes/
│   ├── authRoutes.js        # Authentication endpoints
│   ├── bookingRoutes.js     # Booking endpoints
│   ├── ownerRoutes.js       # Owner endpoints
│   ├── ratingRoutes.js      # Rating endpoints
│   ├── serviceRoutes.js     # Service endpoints
│   ├── salonRoutes.js       # Salon endpoints
│   ├── shopRoutes.js        # Legacy salon routes
│   └── userRoutes.js        # User endpoints
├── utils/
│   └── asyncHandler.js      # Async error handling
├── server.js                # Express app setup
├── package.json             # Dependencies
├── .env.example             # Environment variables template
├── API_DOCUMENTATION.md     # API endpoints documentation
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/user/profile` - Get user profile

### Salons
- `GET /api/salons` - Get all salons
- `GET /api/salons/search` - Search & filter salons
- `GET /api/salons/:id` - Get salon details
- `GET /api/salons/:id/slots` - Get available slots
- `POST /api/salons` - Create salon (Protected)
- `PUT /api/salons/:id` - Update salon (Protected)
- `DELETE /api/salons/:id` - Delete salon (Protected)

### Services
- `GET /api/services/salon/:salonId` - Get salon services
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create service (Protected)
- `PUT /api/services/:id` - Update service (Protected)
- `DELETE /api/services/:id` - Delete service (Protected)

### Bookings
- `POST /api/bookings` - Book service (Protected)
- `GET /api/bookings/my-bookings` - Get user bookings (Protected)
- `GET /api/bookings/:bookingId` - Get booking details (Protected)
- `PUT /api/bookings/:bookingId/cancel` - Cancel booking (Protected)
- `PUT /api/bookings/:bookingId/reschedule` - Reschedule booking (Protected)

### Ratings
- `POST /api/ratings` - Add rating (Protected)
- `GET /api/ratings/salon/:salonId` - Get salon ratings
- `PUT /api/ratings/:ratingId` - Update rating (Protected)
- `DELETE /api/ratings/:ratingId` - Delete rating (Protected)

### Owner Dashboard
- `GET /api/owner/dashboard` - Owner dashboard (Protected)
- `GET /api/owner/:salonId/analytics` - Salon analytics (Protected)
- `POST /api/owner/:salonId/analytics/refresh` - Refresh analytics (Protected)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

## Database Setup

The database schema includes tables for:
- **users** - User accounts with roles
- **salons** - Salon information and details
- **services** - Services offered by salons
- **bookings** - Appointment bookings with status tracking
- **time_slots** - Available time slots for salons
- **ratings** - User ratings and reviews
- **reschedule_history** - History of booking rescheduling
- **salon_analytics** - Daily analytics and revenue tracking

Run `psql saluun < database/setup.sql` to create all tables.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. 

1. User registers: `POST /api/auth/register`
2. User logs in: `POST /api/auth/login` (receives token)
3. Include token in request header: `Authorization: Bearer {token}`

Tokens expire after 24 hours.

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Example Usage

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Get All Salons
```bash
curl http://localhost:5000/api/salons
```

### 4. Book an Appointment
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "salonId": 1,
    "serviceId": 5,
    "date": "2026-03-20",
    "time": "14:00"
  }'
```

## Development

### Running Tests
```bash
npm test
```

### Code Style
The project follows standard JavaScript/Node.js conventions.

### Debugging
Enable debug logs by setting:
```bash
DEBUG=* npm run dev
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env
- Check database user permissions

### JWT Errors
- Ensure JWT_SECRET is set in .env
- Token may be expired (relogin)
- Check token format in Authorization header

### Port Already in Use
- Change PORT in .env
- Or kill the process using the port

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## Future Enhancements

- [ ] Payment integration (Stripe/PayPal)
- [ ] Email notifications for bookings
- [ ] SMS notifications
- [ ] Staff management per salon
- [ ] Promotional codes and discounts
- [ ] Mobile app push notifications
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Subscription plans for owners

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.

## Contact

For more information about the project, please contact the development team.

---

**Last Updated:** March 2026
**Version:** 1.0.0
