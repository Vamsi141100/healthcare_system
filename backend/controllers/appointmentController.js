const pool = require("../config/db");
const { generateMeetLink } = require("../utils/generateMeetLink");
const { sendEmail } = require('../utils/emailService');
const createAppointment = async (req, res, next) => {
  const { doctor_id, service_id, scheduled_time, patient_notes } = req.body;
  const patient_id = req.user.id;
  if (!doctor_id || !scheduled_time) {
    return res
      .status(400)
      .json({ message: "Doctor ID and scheduled time are required" });
  }

  try {
    let fee = null;
    if (service_id) {
      const [
        services,
      ] = await pool.query("SELECT base_fee FROM services WHERE id = ?", [
        service_id,
      ]);
      if (services.length > 0 && services[0].base_fee) {
        fee = services[0].base_fee;
      }
    }

    const [
      result,
    ] = await pool.query(
      "INSERT INTO appointments (patient_id, doctor_id, service_id, scheduled_time, patient_notes, fee, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        patient_id,
        doctor_id,
        service_id || null,
        scheduled_time,
        patient_notes || null,
        fee,
        "pending",
        "unpaid",
      ]
    );

    const [
      newAppointment,
    ] = await pool.query("SELECT * FROM appointments WHERE id = ?", [
      result.insertId,
    ]);

    
    const [detailsForEmail] = await pool.query(
        `SELECT a.scheduled_time, p.email as patient_email, d_user.name as doctor_name
         FROM appointments a
         JOIN users p ON a.patient_id = p.id
         LEFT JOIN doctors doc ON a.doctor_id = doc.id
         LEFT JOIN users d_user ON doc.user_id = d_user.id
         WHERE a.id = ?`, [result.insertId]
     );
 
     if(detailsForEmail.length > 0) {
       const details = detailsForEmail[0];
       const scheduledTime = new Date(details.scheduled_time).toLocaleString();
       sendEmail({
           to: details.patient_email,
           subject: `Appointment Requested with Dr. ${details.doctor_name}`,
           text: `Your appointment request for ${scheduledTime} has been submitted and is pending confirmation by the doctor.`,
           html: `<p>Your appointment request for <strong>${scheduledTime}</strong> has been submitted and is pending confirmation by the doctor.</p>`,
       });
     }

    res.status(201).json(newAppointment[0]);
  } catch (error) {
    console.error("Create Appointment error:", error);
    next(error);
  }
};

const getMyAppointments = async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { status, past, upcoming } = req.query;
  let query = `
         SELECT
             a.*,
             p.name AS patient_name,
             d_user.name AS doctor_name,
             doc.specialization AS doctor_specialization,
             s.name AS service_name
         FROM appointments a
         JOIN users p ON a.patient_id = p.id
         LEFT JOIN doctors doc ON a.doctor_id = doc.id
         LEFT JOIN users d_user ON doc.user_id = d_user.id
         LEFT JOIN services s ON a.service_id = s.id
         WHERE `;
  const queryParams = [];

  if (userRole === "patient") {
    query += " a.patient_id = ? ";
    queryParams.push(userId);
  } else if (userRole === "doctor") {
    try {
      const [
        doctorRecord,
      ] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [
        userId,
      ]);
      if (doctorRecord.length === 0) {
        return res
          .status(403)
          .json({ message: "Doctor profile not found or not approved." });
      }
      const doctorId = doctorRecord[0].id;
      query += " a.doctor_id = ? ";
      queryParams.push(doctorId);
    } catch (error) {
      console.error("Error finding doctor ID:", error);
      return next(new Error("Could not retrieve doctor information."));
    }
  } else {
    return res
      .status(403)
      .json({ message: "User role cannot view appointments this way." });
  }

  if (status) {
    query += " AND a.status = ? ";
    queryParams.push(status);
  }
  if (past === "true") {
      query += " AND a.scheduled_time < NOW() ";
  }
  if (upcoming === "true") {
      query += " AND a.scheduled_time >= NOW() ";
  }

  try {
      const [appointments] = await pool.query(query, queryParams);
      res.status(200).json(appointments);
  } catch (error) {
    console.error("Get My Appointments error:", error);
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  const appointmentId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const [rows] = await pool.query(
      `
            SELECT
                a.*,
                p.name AS patient_name, p.email AS patient_email,
                d_user.name AS doctor_name, d_user.email AS doctor_email, doc.id as doctors_table_id,
                doc.specialization AS doctor_specialization,
                s.name AS service_name
            FROM appointments a
            JOIN users p ON a.patient_id = p.id
            LEFT JOIN doctors doc ON a.doctor_id = doc.id
            LEFT JOIN users d_user ON doc.user_id = d_user.id
            LEFT JOIN services s ON a.service_id = s.id
            WHERE a.id = ?
        `,
      [appointmentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = rows[0];

    let isAuthorized = false;
    if (userRole === "admin") {
      isAuthorized = true;
    } else if (userRole === "patient" && appointment.patient_id === userId) {
      isAuthorized = true;
    } else if (userRole === "doctor") {
      const [
        doctorRecord,
      ] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [
        userId,
      ]);
      if (
        doctorRecord.length > 0 &&
        doctorRecord[0].id === appointment.doctors_table_id
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this appointment" });
    }

    if (userRole === "patient" && appointment.payment_status !== "paid") {
      appointment.meeting_link = null;
      appointment.google_event_id = null;
    } else if (
      userRole === "patient" &&
      appointment.payment_status === "paid" &&
      !appointment.meeting_link
    ) {
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Get Appointment By ID error:", error);
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  const appointmentId = req.params.id;
  const { status, fee, payment_status, doctor_notes } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!status && !fee && !payment_status && !doctor_notes) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM appointments WHERE id = ?", [
      appointmentId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const appointment = rows[0];

    let isAuthorized = false;
    let isDoctorAssigned = false;

    if (userRole === "admin") {
      isAuthorized = true;
    } else if (userRole === "doctor") {
      const [
        doctorRecord,
      ] = await pool.query("SELECT id FROM doctors WHERE user_id = ?", [
        userId,
      ]);
      if (
        doctorRecord.length > 0 &&
        doctorRecord[0].id === appointment.doctor_id
      ) {
        isAuthorized = true;
        isDoctorAssigned = true;
      }
    }

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this appointment" });
    }

    const fieldsToUpdate = {};
    let query = "UPDATE appointments SET ";
    const queryParams = [];

    if (isDoctorAssigned) {
      if (status && ["confirmed", "completed", "cancelled"].includes(status)) {
        fieldsToUpdate.status = status;
      }
      if (fee && parseFloat(fee) >= 0) {
        fieldsToUpdate.fee = parseFloat(fee);
      }
      if (doctor_notes !== undefined) {
        fieldsToUpdate.doctor_notes = doctor_notes;
      }
      if (status === "confirmed" && !appointment.meeting_link) {
        const { meetLink, googleEventId } = generateMeetLink(
          appointmentId,
          appointment.scheduled_time
        );
        fieldsToUpdate.meeting_link = meetLink;
        fieldsToUpdate.google_event_id = googleEventId;
      }
    }

    if (
      userRole === "admin" &&
      payment_status &&
      ["unpaid", "paid"].includes(payment_status)
    ) {
      fieldsToUpdate.payment_status = payment_status;
    }

    const updateEntries = Object.entries(fieldsToUpdate);
    if (updateEntries.length === 0) {
      return res
        .status(400)
        .json({
          message:
            "No permissible fields to update for your role or invalid values provided.",
        });
    }

    query += updateEntries
      .map(([key, value]) => {
        queryParams.push(value);
        return `${key} = ?`;
      })
      .join(", ");

    query += " WHERE id = ?";
    queryParams.push(appointmentId);

    await pool.query(query, queryParams);

    const [
      updatedAppointment,
    ] = await pool.query("SELECT * FROM appointments WHERE id = ?", [
      appointmentId,
    ]);

    res.status(200).json(updatedAppointment[0]);
  } catch (error) {
    console.error("Update Appointment error:", error);
    next(error);
  }
};

const uploadPrescriptionForAppointment = async (req, res, next) => {
  const appointmentId = req.params.id;
  const userId = req.user.id;
  const { pharmacy_id } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "No prescription file uploaded" });
  }
  const prescriptionPath = req.file.path.replace(/\\/g, "/");
  const relativePath = prescriptionPath.substring(
    prescriptionPath.indexOf("/uploads/")
  );

  try {
    const [
      rows,
    ] = await pool.query(
      "SELECT a.id, doc.user_id FROM appointments a JOIN doctors doc ON a.doctor_id = doc.id WHERE a.id = ?",
      [appointmentId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const appointment = rows[0];

    if (appointment.user_id !== userId) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting unauthorized upload:", err);
      });
      return res
        .status(403)
        .json({
          message: "Not authorized to upload prescription for this appointment",
        });
    }

    await pool.query(
      "UPDATE appointments SET prescription_path = ?, status = ?, pharmacy_id = ? WHERE id = ?",
      [relativePath, "completed", pharmacy_id || null, appointmentId]
    );

    const [
      updatedAppointment,
    ] = await pool.query("SELECT * from appointments WHERE id = ?", [
      appointmentId,
    ]);

    res.status(200).json({
      message: "Prescription uploaded successfully",
      prescriptionPath: relativePath,
      appointment: updatedAppointment[0],
    });
  } catch (error) {
    console.error("Upload Prescription error:", error);
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file after DB error:", err);
      });
    }
    next(error);
  }
};

const markAppointmentAsPaid = async (req, res, next) => {
  const appointmentId = req.params.id;
  const patientId = req.user.id;
  try {
    const [rows] = await pool.query("SELECT * FROM appointments WHERE id = ?", [
      appointmentId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const appointment = rows[0];

    if (appointment.patient_id !== patientId) {
      return res
        .status(403)
        .json({ message: "Not authorized to pay for this appointment" });
    }

    if (appointment.payment_status === "paid") {
      return res.status(400).json({ message: "Appointment is already paid" });
    }
    if (
      appointment.status === "cancelled" ||
      appointment.status === "completed"
    ) {
      return res
        .status(400)
        .json({
          message: `Cannot pay for a ${appointment.status} appointment`,
        });
    }
    if (!appointment.fee || appointment.fee <= 0) {
      return res
        .status(400)
        .json({
          message:
            "Payment cannot be processed as the fee is not set or is zero",
        });
    }

    let newStatus = appointment.status;
    if (appointment.status === "pending") {
      newStatus = "confirmed";
    }
    let meetingLink = appointment.meeting_link;
    let googleEventId = appointment.google_event_id;
    if (newStatus === "confirmed" && !meetingLink) {
      const meetDetails = generateMeetLink(
        appointmentId,
        appointment.scheduled_time
      );
      meetingLink = meetDetails.meetLink;
      googleEventId = meetDetails.googleEventId;
    }

    const updateQuery = `
            UPDATE appointments
            SET payment_status = 'paid', status = ?, meeting_link = ?, google_event_id = ?, updated_at = NOW()
            WHERE id = ? AND payment_status = 'unpaid'
         `;
    const [result] = await pool.query(updateQuery, [
      newStatus,
      meetingLink,
      googleEventId,
      appointmentId,
    ]);

    if (result.affectedRows === 0) {
      console.warn(
        `Payment update failed for appointment ${appointmentId}, potentially already updated.`
      );
      return res
        .status(409)
        .json({
          message:
            "Payment status might have changed. Please refresh and try again.",
        });
    }

    const [
      updatedAppointment,
    ] = await pool.query("SELECT * FROM appointments WHERE id = ?", [
      appointmentId,
    ]);

    res.status(200).json(updatedAppointment[0]);
  } catch (error) {
    console.error("Mark Appointment As Paid error:", error);
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  uploadPrescriptionForAppointment,
  markAppointmentAsPaid,
};