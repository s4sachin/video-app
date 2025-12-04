import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import VideoCard from '../components/VideoCard';

interface Video {
  _id: string;
  title: string;
  description?: string;
  processing: { 
    status: string; 
    result?: { 
      sensitivity: string; 
      confidence: number 
    } 
  };
  fileInfo: { size: number };
  createdAt: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as any)?.message;
  const { on } = useSocket();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchVideos = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filter) params.append('status', filter);

      const response = await api.get<{
        success: true;
        data: { videos: Video[]; total: number; page: number; limit: number };
      }>(`/videos/list?${params}`);

      if (response.success && response.data) {
        setVideos(response.data.videos);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Listen for real-time updates
  useEffect(() => {
    const unsubComplete = on('processing_completed', (data) => {
      console.log('📹 Processing completed event:', data);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId
            ? { ...v, processing: { status: 'completed', result: data.result } }
            : v
        )
      );
    });

    const unsubStarted = on('processing_started', (data) => {
      console.log('📹 Processing started event:', data);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId
            ? { ...v, processing: { ...v.processing, status: 'processing' } }
            : v
        )
      );
    });

    return () => {
      unsubComplete?.();
      unsubStarted?.();
    };
  }, [on]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v._id !== videoId));
  };

  const canUpload = user?.role === 'editor' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                🎬 Video App
              </Link>
              <div className="hidden md:flex gap-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/upload"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Upload
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {['', 'pending', 'processing', 'completed', 'failed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded text-sm ${
                  filter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>

          {canUpload && (
            <Link
              to="/upload"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Upload Video
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow p-8">
            <p className="text-lg mb-2">No videos found.</p>
            {canUpload && <p>Upload your first video to get started!</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
