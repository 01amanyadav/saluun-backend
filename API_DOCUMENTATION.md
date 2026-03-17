# Saluun API Documentation

## Overview
Saluun is a comprehensive salon booking platform API built with Node.js and Express. This document outlines all available endpoints and their usage.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Routes `/auth`

### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object with id, name, email

### Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** JWT token (valid for 1 day)

---

## User Routes `/user`

### Get User Profile
- **GET** `/user/profile` (Protected)
- **Response:** User profile data (id, name, email)

---

## Salon Routes `/salons`

### Get All Salons
- **GET** `/salons`
- **Response:** Array of all active salons

### Get Single Salon
- **GET** `/salons/:id`
- **Response:** Salon object with details

### Search & Filter Salons
- **GET** `/salons/search`
- **Query Parameters:**
  - `search`: Search term (salon name or location)
  - `location`: Filter by location
  - `minRating`: Minimum rating (1-5)
  - `maxPrice`: Maximum service price
- **Response:** Filtered salons array

### Get Available Time Slots
- **GET** `/salons/:id/slots`
- **Query Parameters:**
  - `date`: Date in YYYY-MM-DD format (required)
- **Response:** List of available time slots for the date

### Create New Salon (Protected)
- **POST** `/salons` 
- **Body:**
  ```json
  {
    "name": "Elite Hair Studio",
    "location": "123 Main St, Downtown",
    "description": "Premium hair styling salon",
    "phone": "555-1234",
    "email": "salon@example.com",
    "openingTime": "10:00:00",
    "closingTime": "20:00:00"
  }
  ```
- **Response:** Created salon object

### Update Salon (Protected)
- **PUT** `/salons/:id`
- **Body:** Any fields to update (name, description, location, etc.)
- **Response:** Updated salon object

### Delete Salon (Protected)
- **DELETE** `/salons/:id`
- **Response:** Deleted salon object (marked as inactive)

### My Salons (Protected)
- **GET** `/salons/owner/my-salons`
- **Response:** Array of salons owned by the user

---

## Service Routes `/services`

### Get Salon Services
- **GET** `/services/salon/:salonId`
- **Response:** Array of services for the salon

### Get Service Details
- **GET** `/services/:id`
- **Response:** Service object with price, duration, description

### Create Service (Protected)
- **POST** `/services`
- **Body:**
  ```json
  {
    "salonId": 1,
    "name": "Haircut",
    "description": "Professional haircut with styling",
    "price": 25.00,
    "durationMinutes": 30
  }
  ```
- **Response:** Created service object

### Update Service (Protected)
- **PUT** `/services/:id`
- **Body:** Fields to update (name, description, price, durationMinutes)
- **Response:** Updated service object

### Delete Service (Protected)
- **DELETE** `/services/:id`
- **Response:** Deleted service object

---

## Booking Routes `/bookings`

### Book Service (Protected)
- **POST** `/bookings`
- **Body:**
  ```json
  {
    "salonId": 1,
    "serviceId": 5,
    "date": "2026-03-20",
    "time": "14:00"
  }
  ```
- **Response:** Booking confirmation with details

### Get My Bookings (Protected)
- **GET** `/bookings/my-bookings`
- **Response:** Array of user's bookings (all statuses)

### Get Booking Details (Protected)
- **GET** `/bookings/:bookingId`
- **Response:** Complete booking information

### Cancel Booking (Protected)
- **PUT** `/bookings/:bookingId/cancel`
- **Response:** Updated booking with status "cancelled"

### Reschedule Booking (Protected)
- **PUT** `/bookings/:bookingId/reschedule`
- **Body:**
  ```json
  {
    "newDate": "2026-03-22",
    "newTime": "15:00",
    "reason": "Conflict with work schedule"
  }
  ```
- **Response:** Updated booking with new date/time

### Get Salon Bookings (Protected - Owner Only)
- **GET** `/bookings/salon/:salonId/all`
- **Response:** All bookings for the salon

### Get Salon Bookings by Date (Protected - Owner Only)
- **GET** `/bookings/salon/:salonId/date`
- **Query Parameters:**
  - `date`: Date in YYYY-MM-DD format
- **Response:** Bookings for the specific date

### Mark Booking Completed (Protected)
- **PUT** `/bookings/:bookingId/complete`
- **Response:** Booking marked as completed

---

## Rating Routes `/ratings`

### Add Rating (Protected)
- **POST** `/ratings`
- **Body:**
  ```json
  {
    "salonId": 1,
    "rating": 5,
    "review": "Excellent service and friendly staff!",
    "bookingId": 123
  }
  ```
- **Response:** Rating object

### Get Salon Ratings
- **GET** `/ratings/salon/:salonId`
- **Response:** All ratings for the salon with average rating

### Get Salon Average Rating
- **GET** `/ratings/salon/:salonId/average`
- **Response:** Average rating and total count

### Update Rating (Protected)
- **PUT** `/ratings/:ratingId`
- **Body:**
  ```json
  {
    "rating": 4,
    "review": "Updated review"
  }
  ```
- **Response:** Updated rating object

### Delete Rating (Protected)
- **DELETE** `/ratings/:ratingId`
- **Response:** Deleted rating confirmation

---

## Owner Routes `/owner`

### Get Owner Dashboard (Protected)
- **GET** `/owner/dashboard`
- **Response:** Dashboard with all salons, bookings stats, and revenue

### Get Owner's Salons (Protected)
- **GET** `/owner/salons`
- **Response:** All salons owned by the user

### Get Salon Analytics (Protected)
- **GET** `/owner/:salonId/analytics`
- **Query Parameters:**
  - `startDate`: Optional start date (YYYY-MM-DD)
  - `endDate`: Optional end date (YYYY-MM-DD)
- **Response:** Analytics data including bookings, revenue, ratings

### Refresh Analytics (Protected)
- **POST** `/owner/:salonId/analytics/refresh`
- **Response:** Updated analytics data

### Get Salon Bookings (Protected)
- **GET** `/owner/:salonId/bookings`
- **Query Parameters:**
  - `date`: Optional date filter (YYYY-MM-DD)
- **Response:** Bookings for the salon

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized (Missing/Invalid token)
- **403**: Forbidden (Insufficient permissions)
- **404**: Not Found
- **500**: Server Error

---

## Database Schema

### Users Table
- id (Primary Key)
- name, email, password
- phone, role (customer/salon_owner/admin)
- is_active, created_at, updated_at

### Salons Table
- id (Primary Key)
- owner_id (Foreign Key - users)
- name, location, description
- phone, email
- rating, total_ratings
- opening_time, closing_time
- is_active, created_at, updated_at

### Services Table
- id (Primary Key)
- salon_id (Foreign Key - salons)
- name, description, price
- duration_minutes
- is_active, created_at, updated_at

### Bookings Table
- id (Primary Key)
- user_id, salon_id, service_id (Foreign Keys)
- date, time
- status (pending/confirmed/completed/cancelled/rescheduled)
- notes, created_at, updated_at

### Ratings Table
- id (Primary Key)
- user_id, salon_id, booking_id (Foreign Keys)
- rating (1-5), review
- created_at, updated_at

### Time Slots Table
- id (Primary Key)
- salon_id (Foreign Key - salons)
- date, time
- is_available

### Salon Analytics Table
- id (Primary Key)
- salon_id (Foreign Key - salons)
- total_bookings, completed_bookings, cancelled_bookings
- total_revenue, average_rating
- date, created_at, updated_at

---

## Example Workflows

### User Booking Flow
1. User registers: `POST /auth/register`
2. User logs in: `POST /auth/login` (get token)
3. Browse salons: `GET /salons`
4. Search salons: `GET /salons/search?location=downtown`
5. View services: `GET /services/salon/1`
6. Check availability: `GET /salons/1/slots?date=2026-03-20`
7. Book service: `POST /bookings`
8. View bookings: `GET /bookings/my-bookings`
9. Rate salon: `POST /ratings`

### Salon Owner Workflow
1. Create salon: `POST /salons`
2. Add services: `POST /services`
3. View dashboard: `GET /owner/dashboard`
4. Check bookings: `GET /owner/:salonId/bookings`
5. View analytics: `GET /owner/:salonId/analytics`
6. Manage services: `PUT /services/:id`, `DELETE /services/:id`

---

## Environment Variables Required
```
DATABASE_URL=postgresql://user:password@localhost:5432/saluun
JWT_SECRET=your_secret_key_here
PORT=5000
```

---

## Future Enhancements
- Payment integration (Stripe/PayPal)
- SMS/Email notifications
- Staff management per salon
- Custom availability/blackout dates
- Mobile app push notifications
- Review moderation system
- Promotional codes and discounts
- Multi-language support
