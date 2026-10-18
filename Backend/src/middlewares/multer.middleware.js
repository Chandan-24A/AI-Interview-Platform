import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

/*
 multer to accept pdf file from frontend , store and read the file.
*/

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure upload directory exists (Backend/public)
const uploadDir = path.resolve(__dirname, '../../public')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: function(req, file, cb){
        const filename = Date.now() + "-" + file.originalname

        cb(null, filename)
    }
})

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

