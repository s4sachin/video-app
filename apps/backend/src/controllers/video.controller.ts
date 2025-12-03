import { Request, Response } from 'express';
import { Video } from '../models/Video';
import { UploadVideoInput, VideoListQuery } from '@video-app/shared';
import { processVideo } from '../services/processing.service';

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No video file uploaded',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Accept any video file regardless of field name
    const file = files[0];

    const { title, description, tags } = req.body as UploadVideoInput;

    const video = await Video.create({
      title,
      description,
      tags: tags || [],
      fileInfo: {
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimeType: file.mimetype,
      },
      uploadedBy: req.user?.userId,
      processing: {
        status: 'pending',
      },
    });

    // Trigger async processing (don't await)
    processVideo(video._id.toString(), req.user!.userId).catch(console.error);

    res.status(201).json({
      success: true,
      data: {
        videoId: video._id,
        title: video.title,
        status: video.processing.status,
        message: 'Video uploaded successfully. Processing started.',
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

export const listVideos = async (req: Request, res: Response) => {
  try {
    const { page, limit, status, sortBy, order, search } = req.query as unknown as VideoListQuery;

    const query: any = {
      uploadedBy: req.user?.userId,
      deletedAt: null,
    };

    if (status) query['processing.status'] = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortField = sortBy === 'uploadDate' ? 'createdAt' : sortBy;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-fileInfo.path'),
      Video.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch videos',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findOne({
      _id: videoId,
      uploadedBy: req.user?.userId,
      deletedAt: null,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
          timestamp: new Date().toISOString(),
        },
      });
    }

    res.json({
      success: true,
      data: { video },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch video',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

export const reprocessVideo = async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findOne({
      _id: videoId,
      deletedAt: null,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'VIDEO_NOT_FOUND',
          message: 'Video not found',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Reset and reprocess
    await Video.findByIdAndUpdate(videoId, {
      'processing.status': 'pending',
      'processing.result': null,
      'processing.error': null,
    });

    processVideo(videoId, req.user!.userId).catch(console.error);

    res.json({
      success: true,
      message: 'Reprocessing started',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REPROCESS_FAILED',
        message: 'Failed to reprocess video',
        timestamp: new Date().toISOString(),
      },
    });
  }
};
