-- schema.sql
-- Run this script in your MySQL client connected to healthcare_db

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    dob DATE NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    qualifications TEXT NOT NULL, -- Store path or description
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    base_fee DECIMAL(10, 2) DEFAULT 0.00,
    category VARCHAR(100) NOT NULL, -- e.g., 'Consultation', 'Lab Test', 'Medication Delivery'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pharmacies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    delivery_available BOOLEAN DEFAULT false,
    delivery_zips TEXT, -- Comma-separated list of zip codes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    service_id INT NOT NULL,
    scheduled_time DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    fee DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    patient_notes TEXT NULL,
    doctor_notes TEXT NULL,
    prescription_path VARCHAR(255) NULL,
    pharmacy_id INT NOT NULL,
    meeting_link VARCHAR(255) NOT NULL,
    google_event_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    applying_for_role ENUM('doctor') NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    documents_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    status ENUM('open', 'answered', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE insurance_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT UNIQUE NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(255) NOT NULL,
    plan_type VARCHAR(255) NOT NULL,
    insured_name VARCHAR(255) NOT NULL,
    insured_dob DATE NOT NULL,
    insured_sex ENUM('Male', 'Female', 'Other') NOT NULL,
    relationship_to_patient VARCHAR(100) NOT NULL,
    invoice_path VARCHAR(255) NOT NULL,
    insurance_card_front_path VARCHAR(255) NOT NULL,
    government_id_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    admin_notes TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- Add an email column to the pharmacies table
ALTER TABLE pharmacies
ADD COLUMN email VARCHAR(255) NULL AFTER phone_number;

-- Add a column to store the Stripe Payment Intent ID for invoices
ALTER TABLE appointments
ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL AFTER google_event_id;

-- Also ensure your users table has a Date of Birth for prescriptions
ALTER TABLE users
ADD COLUMN dob DATE NULL AFTER email;