import { Router } from 'express';
import { uploadVideo } from '../controllers/video.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { upload } from '../config/upload';

const router = Router();

router.post(
  '/upload',
  authenticate,
  authorize(['admin', 'editor']),
  upload.single('video'),
  uploadVideo
);

export default router;
