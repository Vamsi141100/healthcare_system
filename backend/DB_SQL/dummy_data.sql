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


-- Insurance Claims
-- Appointment IDs: (1, 2, 3, 4)
-- Patients: Alice (2), Bob (3), Diana (5)
INSERT INTO insurance_claims (
    patient_id, appointment_id, provider_name, policy_number, plan_type, 
    insured_name, insured_dob, insured_sex, relationship_to_patient, 
    invoice_path, insurance_card_front_path, government_id_path, status, reviewed_at, admin_notes
) VALUES
-- Claim for Alice (Appointment 1)
(2, 1, 'HealthSecure Insurance Co.', 'POL123456A', 'Gold Health Plan', 
 'Alice Patient', '1990-06-14', 'Female', 'Self', 
 'uploads/invoices/invoice_1.pdf', 
 'uploads/insurance_cards/alice_front.jpg', 
 'uploads/ids/alice_id.jpg', 
 'approved', NOW(), 'All documents verified and claim approved.'),

-- Claim for Bob (Appointment 2)
(3, 2, 'CarePlus Medical Insurance', 'POL654321B', 'Silver Care Plan', 
 'Bob Patient', '1987-09-20', 'Male', 'Self', 
 'uploads/invoices/invoice_2.pdf', 
 'uploads/insurance_cards/bob_front.jpg', 
 'uploads/ids/bob_id.jpg', 
 'pending', NULL, 'Awaiting insurer verification.'),

-- Another claim for Alice (Appointment 3)
(2, 3, 'HealthSecure Insurance Co.', 'POL123456A', 'Gold Health Plan', 
 'Alice Patient', '1990-06-14', 'Female', 'Self', 
 'uploads/invoices/invoice_3.pdf', 
 'uploads/insurance_cards/alice_front.jpg', 
 'uploads/ids/alice_id.jpg', 
 'rejected', NOW(), 'Claim rejected due to missing prescription details.'),

-- Claim submitted by Diana (Appointment 4)
(5, 4, 'MediTrust Health', 'POL777999C', 'Basic Health Cover', 
 'Diana Applying', '1995-12-02', 'Female', 'Self', 
 'uploads/invoices/invoice_4.pdf', 
 'uploads/insurance_cards/diana_front.jpg', 
 'uploads/ids/diana_id.jpg', 
 'pending', NULL, 'Claim under review.');


-- Pharmacies
INSERT INTO pharmacies (name, address, phone_number, delivery_available, delivery_zips) VALUES
('HealthFirst Pharmacy', '123 Wellness Ave, Mumbai, MH 400001', '+91-9876543210', true, '400001,400002,400003'),
('MediCare Plus', '22 Green Street, Bengaluru, KA 560001', '+91-9123456780', true, '560001,560002,560003,560004'),
('CityCare Pharmacy', '55 Sunshine Road, Delhi, DL 110001', '+91-9988776655', false, NULL),
('QuickMeds Express', '88 Riverbank Lane, Pune, MH 411001', '+91-9001122334', true, '411001,411002,411003,411004,411005'),
('CareZone Drugs', '12 Wellness Plaza, Chennai, TN 600001', '+91-9345678901', false, NULL);
