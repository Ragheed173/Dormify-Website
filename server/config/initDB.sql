CREATE DATABASE IF NOT EXISTS dormify;
USE dormify;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('student', 'admin') DEFAULT 'student',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS housing (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  location    VARCHAR(200) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  type        ENUM('studio', 'apartment', 'dorm', 'shared') NOT NULL,
  available   BOOLEAN DEFAULT TRUE,
  description TEXT,
  amenities   TEXT,
  image       VARCHAR(500),
  rating      DECIMAL(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  bedrooms    INT DEFAULT 1,
  bathrooms   INT DEFAULT 1,
  area        INT DEFAULT 20,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  housing_id  INT NOT NULL,
  check_in    DATE NOT NULL,
  check_out   DATE NOT NULL,
  status      ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  total_price DECIMAL(10,2),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (housing_id) REFERENCES housing(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  housing_id  INT,
  title       VARCHAR(200) NOT NULL,
  category    VARCHAR(100),
  description TEXT NOT NULL,
  urgency     ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status      ENUM('pending', 'in_progress', 'resolved') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- Admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@dormify.com',
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Student users (password: student123)
INSERT INTO users (name, email, password, role) VALUES
('Rami Hasan',    'rami@uni.edu',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Sara Mahmoud',  'sara@uni.edu',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Khalid Ahmed',  'khalid@uni.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Nour Farid',    'nour@uni.edu',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Layla Omar',    'layla@uni.edu',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

INSERT INTO housing (title, location, price, type, available, description, amenities, image, rating, review_count, bedrooms, bathrooms, area) VALUES
('Sunny Studio near Campus', 'Cairo, Egypt', 350, 'studio', TRUE,
 'A bright and modern studio apartment just 5 minutes walk from campus.',
 '["WiFi","AC","Kitchen","Laundry"]',
 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format',
 4.8, 24, 1, 1, 35),

('Modern 2-Bedroom Apartment', 'Alexandria, Egypt', 520, 'apartment', TRUE,
 'Spacious two-bedroom apartment ideal for two students.',
 '["WiFi","AC","Parking","Gym","Security"]',
 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format',
 4.6, 18, 2, 1, 75),

('University Dormitory Block C', 'Giza, Egypt', 180, 'dorm', FALSE,
 'Official university dormitory. Affordable and social environment.',
 '["WiFi","Study Room","Cafeteria","Laundry"]',
 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format',
 3.9, 42, 1, 1, 20);

INSERT INTO bookings (user_id, housing_id, check_in, check_out, status, total_price) VALUES
(2, 1, '2024-09-01', '2025-06-30', 'confirmed', 3500),
(3, 2, '2025-07-01', '2025-12-31', 'pending',   3120),
(4, 1, '2024-01-01', '2024-06-30', 'cancelled',  2100);

INSERT INTO maintenance (user_id, title, category, description, urgency, status) VALUES
(2, 'Broken air conditioner', 'HVAC',     'The AC stopped working.',  'high',   'in_progress'),
(3, 'Leaking tap',            'Plumbing', 'Bathroom tap is dripping.', 'medium', 'resolved');