import { Router } from 'express';
import { uploadVideo, listVideos, getVideoById, reprocessVideo } from '../controllers/video.controller';
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
  upload.any(),
  uploadVideo
);

router.get('/list', authenticate, validateQuery(videoListQuerySchema), listVideos);
router.post('/:videoId/reprocess', authenticate, authorize(['admin']), reprocessVideo);
router.get('/:videoId', authenticate, getVideoById);

export default router;
