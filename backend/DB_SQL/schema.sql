-- schema.sql
-- Run this script in your MySQL client connected to healthcare_db

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    specialization VARCHAR(255),
    bio TEXT,
    qualifications TEXT, -- Store path or description
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE services ( -- Example, can be expanded
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_fee DECIMAL(10, 2) DEFAULT 0.00,
    category VARCHAR(100), -- e.g., 'Consultation', 'Lab Test', 'Medication Delivery'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT, -- Nullable if it's a service booking without a specific doctor initially
    service_id INT, -- Optional link to a specific service
    scheduled_time DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    fee DECIMAL(10, 2),
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    patient_notes TEXT, -- Notes/description from patient during booking
    doctor_notes TEXT, -- Notes from doctor after consult
    prescription_path VARCHAR(255), -- Path to uploaded prescription file
    meeting_link VARCHAR(255), -- Google Meet link
    google_event_id VARCHAR(255), -- Optional: If integrating with Google Calendar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL, -- User applying
    applying_for_role ENUM('doctor') NOT NULL, -- Can be expanded
    specialization VARCHAR(255),
    bio TEXT,
    documents_path VARCHAR(255) NOT NULL, -- Path to uploaded documents (e.g., a zip file or specific folder)
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT, -- Notes from admin reviewing application
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    status ENUM('open', 'answered', 'closed') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE insurance_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT UNIQUE NOT NULL, -- Each appointment can only have one claim
    provider_name VARCHAR(255) NOT NULL,
    policy_number VARCHAR(255) NOT NULL,
    plan_type VARCHAR(255),
    insured_name VARCHAR(255) NOT NULL,
    insured_dob DATE NOT NULL,
    insured_sex ENUM('Male', 'Female', 'Other') NOT NULL,
    relationship_to_patient VARCHAR(100),
    invoice_path VARCHAR(255) NOT NULL,
    insurance_card_front_path VARCHAR(255) NOT NULL,
    government_id_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    admin_notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE TABLE pharmacies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone_number VARCHAR(255),
    delivery_available BOOLEAN DEFAULT false,
    delivery_zips TEXT, -- Comma-separated list of zip codes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE appointments ADD COLUMN pharmacy_id INT NULL AFTER prescription_path;
ALTER TABLE appointments ADD FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL;

-- Potentially add a table for Personal Health Records (PHR)
-- CREATE TABLE health_records ( ... ); This needs careful design based on requirements

-- Potentially add a table for Patient uploaded documents for appointments
-- CREATE TABLE appointment_documents ( ... );
