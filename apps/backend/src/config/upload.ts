import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from './index.js';
import { ALLOWED_VIDEO_TYPES, MAX_FILE_SIZE } from '@video-app/shared';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
if (config.USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
  });
}

// Choose storage based on configuration
let storage: multer.StorageEngine;

if (config.USE_CLOUDINARY) {
  // Cloudinary Storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      return {
        folder: 'video-app',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
        public_id: `video-${uniqueSuffix}`,
      };
    },
  });
} else {
  // Local Disk Storage (for development)
  const uploadDir = path.resolve(config.UPLOAD_DIR);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `video-${uniqueSuffix}${ext}`);
    },
  });
}

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Middleware to normalize Cloudinary file info
export const normalizeCloudinaryFile = (req: any, res: any, next: any) => {
  if (config.USE_CLOUDINARY && req.files && req.files.length > 0) {
    req.files = req.files.map((file: any) => {
      // Cloudinary returns url and public_id, we need to normalize this
      if (file.path && file.path.startsWith('http')) {
        file.cloudinaryUrl = file.path;
        file.cloudinaryPublicId = file.filename;
      }
      return file;
    });
  }
  next();
};
