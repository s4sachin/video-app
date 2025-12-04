import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

interface Video {
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
  };
  createdAt: string;
}

interface Props {
  video: Video;
  onDelete?: (videoId: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const sensitivityColors: Record<string, string> = {
  safe: 'bg-green-500',
  flagged: 'bg-red-500',
  review: 'bg-yellow-500',
};

const VideoCard: React.FC<Props> = ({ video, onDelete }) => {
  const [confirming, setConfirming] = useState(false);
  const status = video.processing.status;
  const sensitivity = video.processing.result?.sensitivity;

  const handleDelete = async () => {
    try {
      const response = await api.delete<{ success: true; data: { message: string } }>(
        `/videos/${video._id}`
      );
      if (response.success) {
        onDelete?.(video._id);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="aspect-video bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        {sensitivity && (
          <div
            className={`absolute top-2 right-2 w-3 h-3 rounded-full ${sensitivityColors[sensitivity]}`}
            title={sensitivity}
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold truncate">{video.title}</h3>
        <p className="text-sm text-gray-500 truncate">
          {video.description || 'No description'}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span
            className={`text-xs px-2 py-1 rounded-full ${statusColors[status]}`}
          >
            {status}
          </span>
          <span className="text-xs text-gray-400">
            {(video.fileInfo.size / (1024 * 1024)).toFixed(1)} MB
          </span>
        </div>

        {status === 'completed' && (
          <Link
            to={`/video/${video._id}`}
            className="mt-3 block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
          >
            Watch
          </Link>
        )}

        <div className="mt-2 pt-2 border-t">
          {confirming ? (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-1 rounded text-sm"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 bg-gray-200 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="w-full text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
