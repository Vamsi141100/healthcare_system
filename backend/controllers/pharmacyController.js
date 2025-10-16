const pool = require("../config/db");

const createPharmacy = async (req, res, next) => {
    const { name, address, phone_number, delivery_available, delivery_zips } = req.body;
    try {
        const [result] = await pool.query(
            "INSERT INTO pharmacies (name, address, phone_number, delivery_available, delivery_zips) VALUES (?, ?, ?, ?, ?)",
            [name, address, phone_number, delivery_available || false, delivery_zips]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        next(error);
    }
};

const getAllPharmacies = async (req, res, next) => {
    try {
        const [pharmacies] = await pool.query("SELECT id, name, address, phone_number, delivery_available, delivery_zips FROM pharmacies ORDER BY name");
        res.status(200).json(pharmacies);
    } catch (error) {
        next(error);
    }
};

const updatePharmacy = async (req, res, next) => {
    const { id } = req.params;
    const { name, address, phone_number, delivery_available, delivery_zips } = req.body;
    try {
        const [result] = await pool.query(
            "UPDATE pharmacies SET name = ?, address = ?, phone_number = ?, delivery_available = ?, delivery_zips = ? WHERE id = ?",
            [name, address, phone_number, delivery_available, delivery_zips, id]
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