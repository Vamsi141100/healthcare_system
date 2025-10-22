const pool = require("../config/db");

const validatePharmacyData = (data) => {
    const { name, address, phone_number, email } = data;
    if (!name || !address || !phone_number || !email) {
        return "Name, address, phone number, and email are all required fields.";
    }
    
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return "Please provide a valid email address.";
    }
    return null; 
};

const createPharmacy = async (req, res, next) => {
    
    const validationError = validatePharmacyData(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const { name, address, phone_number, email, delivery_available, delivery_zips } = req.body;
    try {
        const [result] = await pool.query(
            "INSERT INTO pharmacies (name, address, phone_number, email, delivery_available, delivery_zips) VALUES (?, ?, ?, ?, ?, ?)",
            [name, address, phone_number, email, delivery_available || false, delivery_zips]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        next(error);
    }
};

const getAllPharmacies = async (req, res, next) => {
    try {
        const [pharmacies] = await pool.query("SELECT * FROM pharmacies ORDER BY name"); 
        res.status(200).json(pharmacies);
    } catch (error) {
        next(error);
    }
};

const updatePharmacy = async (req, res, next) => {
    const { id } = req.params;

    
    const validationError = validatePharmacyData(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const { name, address, phone_number, email, delivery_available, delivery_zips } = req.body;
    try {
        const [result] = await pool.query(
            "UPDATE pharmacies SET name = ?, address = ?, phone_number = ?, email = ?, delivery_available = ?, delivery_zips = ? WHERE id = ?",
            [name, address, phone_number, email, delivery_available, delivery_zips, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pharmacy not found' });
        }
        res.status(200).json({ message: 'Pharmacy updated successfully' });
    } catch (error) {
        next(error);
    }
};

const deletePharmacy = async (req, res, next) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM pharmacies WHERE id = ?", [id]);
        res.status(200).json({ message: 'Pharmacy deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPharmacy,
    getAllPharmacies,
    updatePharmacy,
    deletePharmacy
};