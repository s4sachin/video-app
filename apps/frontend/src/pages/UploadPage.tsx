import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoUpload from '../components/VideoUpload';
import Header from '../components/Header';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = (location.state as any)?.message;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Centered Heading */}
        <div className="mb-8 text-center">
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
      </div>
    </div>
  );
}
