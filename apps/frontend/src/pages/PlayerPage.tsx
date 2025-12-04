import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface VideoDetails {
  _id: string;
  title: string;
  description?: string;
  processing: {
    status: string;
    result?: {
      sensitivity: string;
      confidence: number;
    };
  };
  fileInfo: {
    size: number;
    mimeType: string;
  };
  metadata?: {
    duration?: number;
  };
  viewCount: number;
  createdAt: string;
}

const PlayerPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await api.get<{ success: true; data: { video: VideoDetails } }>(
          `/videos/${videoId}`
        );

        if (response.success && response.data) {
          setVideo(response.data.video);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) fetchVideo();
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <p className="text-red-500 text-xl mb-4">{error || 'Video not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const streamUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/videos/${videoId}/stream`;
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white p-4 hover:text-gray-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Video Player */}
        <div className="aspect-video bg-black">
          {video.processing.status === 'completed' ? (
            <video
              controls
              className="w-full h-full"
              src={`${streamUrl}?token=${token}`}
            >
              <source
                src={`${streamUrl}?token=${token}`}
                type={video.fileInfo.mimeType}
              />
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xl">Video is still processing...</p>
                <p className="text-gray-400 mt-2">Status: {video.processing.status}</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="bg-gray-900 text-white p-6">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          {video.description && (
            <p className="text-gray-400 mt-2">{video.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
            <span>Views: {video.viewCount}</span>
            <span>
              Size: {(video.fileInfo.size / (1024 * 1024)).toFixed(1)} MB
            </span>
            {video.processing.result && (
              <span
                className={`px-2 py-1 rounded ${
                  video.processing.result.sensitivity === 'safe'
                    ? 'bg-green-600'
                    : video.processing.result.sensitivity === 'flagged'
                    ? 'bg-red-600'
                    : 'bg-yellow-600'
                }`}
              >
                {video.processing.result.sensitivity} (
                {video.processing.result.confidence}% confidence)
              </span>
            )}
            <span>
              Uploaded: {new Date(video.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
