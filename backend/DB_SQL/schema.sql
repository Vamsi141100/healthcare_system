-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS healthcare_db;
USE healthcare_db;

-- Table for user accounts
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    dob DATE NULL, -- Date of Birth for prescriptions
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for doctor-specific profiles, linked to a user account
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    specialization VARCHAR(255),
    bio TEXT,
    qualifications TEXT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for services offered (e.g., different types of consultations, lab tests)
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_fee DECIMAL(10, 2) DEFAULT 0.00,
    category VARCHAR(100), -- e.g., 'Consultation', 'Lab Test', 'Medication'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for pharmacies
CREATE TABLE pharmacies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    delivery_available BOOLEAN DEFAULT false,
    delivery_zips TEXT, -- Comma-separated list of zip codes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Main table for appointments
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT,
    service_id INT,
    scheduled_time DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    fee DECIMAL(10, 2),
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    patient_notes TEXT,
    doctor_notes TEXT,
    prescription_path VARCHAR(255),
    pharmacy_id INT NULL, -- Link to a pharmacy
    google_event_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255), -- For invoices
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE SET NULL
);

-- Table for doctor applications
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    applying_for_role ENUM('doctor') NOT NULL,
    specialization VARCHAR(255),
    bio TEXT,
    documents_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for user support tickets
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

-- Table for insurance claims submitted by patients
CREATE TABLE insurance_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    appointment_id INT UNIQUE NOT NULL,
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