import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoUpload from '../components/VideoUpload';

export default function UploadPage() {
  const { user } = useAuth();
  const location = useLocation();
  const message = (location.state as any)?.message;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Upload Video</h1>
          <p className="text-gray-600 mt-2">
            Upload your video for sensitivity analysis
          </p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <VideoUpload />

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            📝 Upload Guidelines
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Maximum file size: 100MB</li>
            <li>• Supported formats: MP4, MOV, AVI, WebM</li>
            <li>• Processing typically takes 2-10 seconds</li>
            <li>• You'll receive real-time updates on the dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
