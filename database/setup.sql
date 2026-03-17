-- Saluun Database Setup
-- This script creates all necessary tables for the salon booking platform

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(50) DEFAULT 'customer', -- 'customer' or 'salon_owner'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salons Table
CREATE TABLE IF NOT EXISTS salons (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    phone VARCHAR(15),
    email VARCHAR(100),
    rating DECIMAL(2, 1) DEFAULT 0.0, -- 0-5 star rating
    total_ratings INTEGER DEFAULT 0,
    opening_time TIME DEFAULT '10:00:00',
    closing_time TIME DEFAULT '20:00:00',
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL, -- Service duration in minutes
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time Slots Table
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(salon_id, date, time)
);

-- Bookings Table (Updated)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(salon_id, date, time)
);

-- Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, salon_id, booking_id)
);

-- Reschedule History Table
CREATE TABLE IF NOT EXISTS reschedule_history (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    old_date DATE NOT NULL,
    old_time TIME NOT NULL,
    new_date DATE NOT NULL,
    new_time TIME NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salon Analytics Table
CREATE TABLE IF NOT EXISTS salon_analytics (
    id SERIAL PRIMARY KEY,
    salon_id INTEGER NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    total_bookings INTEGER DEFAULT 0,
    completed_bookings INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0.0,
    average_rating DECIMAL(2, 1) DEFAULT 0.0,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Better Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_salons_owner_id ON salons(owner_id);
CREATE INDEX idx_services_salon_id ON services(salon_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_salon_id ON bookings(salon_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_ratings_salon_id ON ratings(salon_id);
CREATE INDEX idx_time_slots_salon_date ON time_slots(salon_id, date);
