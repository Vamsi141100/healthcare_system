-- Dummy data for the healthcare_db
-- Passwords for all users are hashed from 'password123'

-- USERS
-- Three patients
INSERT INTO `users` (`id`, `name`, `email`, `dob`, `password_hash`, `role`) VALUES
(1, 'Admin User', 'admin@healthhub.com', '1985-01-01', '$2b$10$E.p/M1gMhNoe9L6/pUu.deNNCpX1E1wVv5gw7F5L97q8a1jMwhSua', 'admin'),
(2, 'Dr. Alice Martin', 'alice@healthhub.com', '1980-05-15', '$2b$10$E.p/M1gMhNoe9L6/pUu.deNNCpX1E1wVv5gw7F5L97q8a1jMwhSua', 'doctor'),
(3, 'Dr. Bob Johnson', 'bob@healthhub.com', '1975-09-20', '$2b$10$E.p/M1gMhNoe9L6/pUu.deNNCpX1E1wVv5gw7F5L97q8a1jMwhSua', 'doctor'),
(4, 'Charlie Brown', 'charlie@patient.com', '1990-03-22', '$2b$10$E.p/M1gMhNoe9L6/pUu.deNNCpX1E1wVv5gw7F5L97q8a1jMwhSua', 'patient'),
(5, 'Diana Prince', 'diana@patient.com', '1988-11-01', '$2b$10$E.p/M1gMhNoe9L6/pUu.deNNCpX1E1wVv5gw7F5L97q8a1jMwhSua', 'patient'),
(6, 'Eve Adams', 'eve@patient.com', '1995-07-30', '$2b$10$E.p/M1gMhNoe9L6/pUu.deNNCpX1E1wVv5gw7F5L97q8a1jMwhSua', 'patient');


-- DOCTORS
-- Two approved doctors linked to user accounts
INSERT INTO `doctors` (`id`, `user_id`, `specialization`, `bio`, `approved_at`) VALUES
(1, 2, 'Cardiology', 'Specializing in heart-related conditions and preventative care. Over 10 years of experience.', NOW()),
(2, 3, 'Dermatology', 'Expert in skin care, from cosmetic procedures to chronic conditions like psoriasis and eczema.', NOW());

-- SERVICES
INSERT INTO `services` (`id`, `name`, `description`, `base_fee`, `category`) VALUES
(1, 'General Consultation', 'A standard 15-minute consultation with a general practitioner.', 75.00, 'Consultation'),
(2, 'Specialist Consultation', 'A 30-minute detailed consultation with a specialist.', 150.00, 'Consultation'),
(3, 'Prescription Refill', 'Request a refill for an existing, non-controlled medication.', 25.00, 'Medication'),
(4, 'Standard Blood Panel', 'Includes CBC, comprehensive metabolic panel, and lipid panel.', 120.00, 'Lab Test');

-- PHARMACIES
-- Two pharmacies, one with delivery
INSERT INTO `pharmacies` (`id`, `name`, `address`, `phone_number`, `email`, `delivery_available`, `delivery_zips`) VALUES
(1, 'Downtown Health Pharmacy', '123 Main St, Anytown, USA 12345', '555-0101', 'orders@downtownpharmacy.test', 1, '12345,12346'),
(2, 'Suburb Pharmacy & Goods', '456 Oak Ave, Suburbia, USA 54321', '555-0102', 'contact@suburbpharm.test', 0, NULL);


-- APPOINTMENTS
-- A few appointments with various statuses to test different features
INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `service_id`, `scheduled_time`, `status`, `fee`, `payment_status`, `stripe_payment_intent_id`) VALUES
(1, 4, 1, 2, DATE_ADD(NOW(), INTERVAL 3 DAY), 'confirmed', 150.00, 'paid', 'pi_...'), -- upcoming, paid
(2, 5, 2, 1, DATE_ADD(NOW(), INTERVAL 5 DAY), 'pending', 75.00, 'unpaid', NULL), -- upcoming, unpaid
(3, 4, 2, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), 'completed', 75.00, 'paid', 'pi_...'), -- past, completed
(4, 6, 1, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'cancelled', 75.00, 'unpaid', NULL), -- past, cancelled
(5, 5, 1, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), 'completed', 150.00, 'paid', 'pi_...'); -- completed, for testing insurance claim

-- SUPPORT TICKETS
INSERT INTO `support_tickets` (`id`, `user_id`, `subject`, `question`, `status`) VALUES
(1, 4, 'Login Issue', 'I cannot reset my password, the link seems broken.', 'open'),
(2, 5, 'Billing Question', 'I was charged twice for my last appointment, can you check?', 'answered'),
(3, 2, 'Profile Update', 'How do I update my specialization on my doctor profile?', 'closed');

UPDATE `support_tickets` SET `answer`='We have reset the password manually. Please check your email.' WHERE id=2;
UPDATE `support_tickets` SET `answer`='You can update your profile from the doctor dashboard under the "Profile" section.', `status`='closed' WHERE id=3;