import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/*
  Multer middleware to safely accept PDF resume files (max 5MB).
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, "../../public");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitize original filename and ensure safe naming
        const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}-${sanitized}`;
        cb(null, filename);
    },
});

const fileFilter = (req, file, cb) => {
    const isPdfExt = path.extname(file.originalname).toLowerCase() === ".pdf";
    const isPdfMime = file.mimetype === "application/pdf";

    if (isPdfExt && isPdfMime) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed!"), false);
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter,
});
