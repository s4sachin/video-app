import { Router } from 'express';
import { uploadVideo, listVideos, getVideoById } from '../controllers/video.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateQuery } from '../middleware/validateQuery';
import { upload } from '../config/upload';
import { videoListQuerySchema } from '@video-app/shared';

const router = Router();

router.post(
  '/upload',
  authenticate,
  authorize(['admin', 'editor']),
  upload.single('video'),
  uploadVideo
);

router.get('/list', authenticate, validateQuery(videoListQuerySchema), listVideos);
router.get('/:videoId', authenticate, getVideoById);

export default router;
