const pool = require("../config/db");
const fs = require("fs");

const submitClaim = async (req, res, next) => {
    const { appointmentId } = req.params;
    const patientId = req.user.id;
    const { provider_name, policy_number, plan_type, insured_name, insured_dob, insured_sex, relationship_to_patient } = req.body;

    if (!req.files || !req.files.invoice || !req.files.insurance_card_front || !req.files.government_id) {
        return res.status(400).json({ message: "All three documents (Invoice, Insurance Card, Government ID) are required." });
    }

    try {
        const [appCheck] = await pool.query(
            "SELECT id FROM appointments WHERE id = ? AND patient_id = ? AND status = 'completed'",
            [appointmentId, patientId]
        );
        if (appCheck.length === 0) {
            return res.status(403).json({ message: "Claim can only be filed for your own completed appointments." });
        }
        const [existingClaim] = await pool.query("SELECT id FROM insurance_claims WHERE appointment_id = ?", [appointmentId]);
        if (existingClaim.length > 0) {
             return res.status(400).json({ message: "A claim has already been submitted for this appointment." });
        }
        
        const getPath = (file) => file[0].path.replace(/\\/g, "/").substring(file[0].path.indexOf('/uploads/'));

        const [result] = await pool.query(
            `INSERT INTO insurance_claims (patient_id, appointment_id, provider_name, policy_number, plan_type, insured_name, insured_dob, insured_sex, relationship_to_patient, invoice_path, insurance_card_front_path, government_id_path, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patientId, appointmentId, provider_name, policy_number, plan_type, insured_name,
                insured_dob, insured_sex, relationship_to_patient,
                getPath(req.files.invoice),
                getPath(req.files.insurance_card_front),
                getPath(req.files.government_id),
                'pending'
            ]
        );

        res.status(201).json({ message: "Insurance claim submitted successfully.", claimId: result.insertId });

    } catch (error) {
        
        Object.values(req.files).forEach(fileArray => {
            fs.unlink(fileArray[0].path, err => {
                if(err) console.error("Error deleting file on claim fail:", err);
            });
        });
        console.error("Submit Claim Error:", error);
        next(error);
    }
};

const getMyClaims = async (req, res, next) => {
    const patientId = req.user.id;
    try {
        const [claims] = await pool.query(
            "SELECT * FROM insurance_claims WHERE patient_id = ? ORDER BY submitted_at DESC",
            [patientId]
        );
        res.status(200).json(claims);
    } catch (error) {
        next(error);
    }
};

const getAllClaims = async (req, res, next) => { 
    try {
         const [claims] = await pool.query(`
            SELECT ic.*, u.name as patient_name, u.email as patient_email
            FROM insurance_claims ic
            JOIN users u ON ic.patient_id = u.id
            ORDER BY ic.submitted_at DESC
        `);
        res.status(200).json(claims);
    } catch(error) {
        next(error);
    }
}

const updateClaimStatus = async (req, res, next) => { 
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        await pool.query(
            "UPDATE insurance_claims SET status = ?, admin_notes = ?, reviewed_at = NOW() WHERE id = ?",
            [status, admin_notes || null, id]
        );
        res.status(200).json({ message: `Claim status updated to ${status}.` });
    } catch (error) {
        next(error);
    }
}

module.exports = { submitClaim, getMyClaims, getAllClaims, updateClaimStatus };