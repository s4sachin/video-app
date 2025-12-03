import { Video, IVideo } from '../models/Video';
import { emitToUser } from '../socket';

interface ProcessingResult {
  sensitivity: 'safe' | 'flagged' | 'review';
  confidence: number;
  processedAt: Date;
}

const simulateProcessing = async (): Promise<ProcessingResult> => {
  // Simulate processing delay (2-10 seconds)
  const delay = Math.floor(Math.random() * 8000) + 2000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 70% safe, 30% flagged
  const isSafe = Math.random() < 0.7;
  const confidence = Math.floor(Math.random() * 20) + 80; // 80-100%

  return {
    sensitivity: isSafe ? 'safe' : 'flagged',
    confidence,
    processedAt: new Date(),
  };
};

export const processVideo = async (videoId: string, userId: string): Promise<IVideo | null> => {
  try {
    // Update status to processing
    await Video.findByIdAndUpdate(videoId, {
      'processing.status': 'processing',
    });

    console.log(`🎬 Starting processing for video: ${videoId}`);

    // Emit processing started event (will be queued if user is disconnected)
    emitToUser(userId, 'processing_started', {
      videoId,
      status: 'processing',
      timestamp: new Date().toISOString(),
    });

    // Simulate processing
    const result = await simulateProcessing();

    console.log(`✅ Processing completed for video: ${videoId} - ${result.sensitivity}`);

    // Update with result
    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        'processing.status': 'completed',
        'processing.result': result,
      },
      { new: true }
    );

    // Emit processing completed event (will be queued if user is disconnected)
    emitToUser(userId, 'processing_completed', {
      videoId,
      status: 'completed',
      result,
      timestamp: new Date().toISOString(),
    });

    return video;
  } catch (error) {
    console.error(`❌ Processing failed for video: ${videoId}`, error);

    // Mark as failed
    await Video.findByIdAndUpdate(videoId, {
      'processing.status': 'failed',
      'processing.error': 'Processing failed',
    });

    // Emit processing failed event (will be queued if user is disconnected)
    emitToUser(userId, 'processing_failed', {
      videoId,
      status: 'failed',
      error: 'Processing failed',
      timestamp: new Date().toISOString(),
    });

    return null;
  }
};
