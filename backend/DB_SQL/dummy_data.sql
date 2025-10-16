-- dummy_data.sql
-- Run this script *after* creating tables

-- NOTE: '$2b$10$rRq1YEm4/3Uyyu0DSepjfOzvZoohyo1WX0ja205hOwNQxTsnnihkG' os actually bcrypt hashes of a common password ('Pass@123')


-- Users
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@health.test', '$2b$10$rRq1YEm4/3Uyyu0DSepjfOzvZoohyo1WX0ja205hOwNQxTsnnihkG', 'admin'),
('Alice Patient', 'alice@patient.test', '$2b$10$rRq1YEm4/3Uyyu0DSepjfOzvZoohyo1WX0ja205hOwNQxTsnnihkG', 'patient'),
('Bob Patient', 'bob@patient.test', '$2b$10$rRq1YEm4/3Uyyu0DSepjfOzvZoohyo1WX0ja205hOwNQxTsnnihkG', 'patient'),
('Dr. Charlie Brown', 'charlie@doctor.test', '$2b$10$rRq1YEm4/3Uyyu0DSepjfOzvZoohyo1WX0ja205hOwNQxTsnnihkG', 'doctor'),
('Diana Applying', 'diana@applicant.test', '$2b$10$rRq1YEm4/3Uyyu0DSepjfOzvZoohyo1WX0ja205hOwNQxTsnnihkG', 'patient');

-- Doctor Profiles (for pre-approved doctors)
-- Get user_id for Dr. Charlie Brown (assuming it's 4 based on above insertions)
INSERT INTO doctors (user_id, specialization, bio, qualifications, approved_at) VALUES
(4, 'General Practice', 'Experienced GP with 10 years in family medicine. Friendly and thorough.', 'MD, Board Certified in Family Medicine', NOW());

-- Services
INSERT INTO services (name, description, base_fee, category) VALUES
('General Consultation', 'Standard 15-minute telehealth consultation.', 50.00, 'Consultation'),
('Follow-up Consultation', '10-minute follow-up visit.', 30.00, 'Consultation'),
('Basic Blood Panel', 'Book a lab test for a standard blood panel.', 75.00, 'Lab Test'),
('Prescription Refill Request', 'Request a refill for an existing prescription (requires doctor review).', 20.00, 'Medication');

-- Appointments
-- Get IDs: Alice (2), Bob (3), Dr. Charlie (4), General Consult (1), Follow-up (2)
INSERT INTO appointments (patient_id, doctor_id, service_id, scheduled_time, status, fee, payment_status, patient_notes) VALUES
(2, 1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 'confirmed', 50.00, 'paid', 'Sore throat and cough.'),
(3, 1, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), 'confirmed', 30.00, 'paid', 'Follow-up on previous symptoms.'),
(2, 1, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), 'completed', 55.00, 'paid', 'Follow up regarding previous symptoms.'),
(5, 1, null, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'pending', null, 'unpaid', 'Urgent query about medication.');

-- Application (Pending)
-- Get user_id for Diana Applying (assuming it's 5)
INSERT INTO applications (user_id, applying_for_role, specialization, bio, documents_path, status) VALUES
(5, 'doctor', 'Cardiology', 'Recent graduate specializing in preventative cardiology.', 'uploads/applications/diana_docs.zip', 'pending');

-- Support Tickets
-- Get user_id for Alice (2), Bob (3)
INSERT INTO support_tickets (user_id, subject, question, status) VALUES
(2, 'Login Issue', 'I forgot my password, how do I reset it?', 'open'),
(3, 'Booking Fee', 'Why was I charged before the appointment?', 'open');
