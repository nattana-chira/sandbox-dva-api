import multer from "multer";
import fs from "fs"
import path from "path"

// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the folder where files will be stored
    const uploadDir = './uploads';
    // Make sure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Store file in 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Use the original file name and append timestamp to ensure uniqueness
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Initialize Multer with storage configuration
export const upload = multer({ storage });