const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const applicationStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/applications/");
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = req.user.id + "-" + Date.now();
    cb(null, "doc-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const prescriptionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/prescriptions/");
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const appointmentId = req.params.id || req.body.appointmentId || "unknown";
    const uniqueSuffix = appointmentId + "-" + Date.now();
    cb(null, "presc-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const claimStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/claims/");
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
 },
 filename: function (req, file, cb) {
   const appointmentId = req.params.appointmentId || 'unknown';
   const uniqueSuffix = `${req.user.id}-${appointmentId}-${Date.now()}`;
   cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
 },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          allowedTypes
      ),
      false
    );
  }
};

const uploadApplicationDoc = multer({
  storage: applicationStorage,
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: fileFilter,
});
const uploadPrescription = multer({
  storage: prescriptionStorage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});
const uploadClaimDocs = multer({
  storage: claimStorage,
  limits: { fileSize: 1024 * 1024 * 10 }, 
  fileFilter: fileFilter,
});
module.exports = {
  uploadApplicationDoc,
  uploadPrescription,
  uploadClaimDocs,
};