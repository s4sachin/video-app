import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { UploadVideoInput } from '@video-app/shared';

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No video file uploaded',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const { title, description, tags } = req.body as UploadVideoInput;

    const video = await Video.create({
      title,
      description,
      tags: tags || [],
      fileInfo: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
      uploadedBy: req.user?.userId,
      processing: {
        status: 'pending',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        videoId: video._id,
        title: video.title,
        status: video.processing.status,
        message: 'Video uploaded successfully. Processing will begin shortly.',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload video',
        timestamp: new Date().toISOString(),
      },
    });
  }
};
