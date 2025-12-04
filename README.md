# Video App - Secure Video Processing Platform

A full-stack video processing application with content sensitivity analysis, real-time Socket.io updates, and secure streaming.

## 🚀 Features

### ✅ Completed
- **User Authentication** - JWT-based auth with role-based access control (Admin, Editor, Viewer)
- **Video Upload** - Drag-and-drop interface with progress tracking (max 100MB)
- **Real-time Processing** - Socket.io for live status updates during video processing
- **Content Analysis** - Automated sensitivity detection (safe, flagged, review)
- **Video Streaming** - Secure token-based streaming with range request support
- **Video Management** - List, filter, delete videos with soft delete
- **Responsive UI** - Modern Tailwind CSS interface

## 📁 Project Structure

```
video-app/
├── apps/
│   ├── backend/          # Express.js API server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── socket/
│   │   │   └── utils/
│   │   └── uploads/      # Video storage
│   │
│   └── frontend/         # React + Vite app
│       └── src/
│           ├── components/
│           ├── context/
│           ├── hooks/
│           ├── pages/
│           └── services/
│
└── packages/
    └── shared/           # Shared types & validation
        └── src/
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript (ESM)
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io 4.8.1
- **File Upload**: Multer
- **Validation**: Zod 4.1.13
- **Dev Tool**: tsx (ESM runner)

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Styling**: Tailwind CSS 3.3.5
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **File Upload**: react-dropzone 14.3.8
- **Real-time**: Socket.io Client

### Shared
- **Validation**: Zod schemas
- **Module System**: Dual ESM (.js) + CommonJS (.cjs) exports

## 📋 Prerequisites

- Node.js 18+ (ESM support required)
- MongoDB Atlas account or local MongoDB
- npm or yarn

## 🔧 Setup Instructions

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd video-app

# Install dependencies for all packages
npm install

# Build shared package
cd packages/shared && npm run build && cd ../..
```

### 2. Backend Setup

```bash
cd apps/backend

# Create environment file
cp .env.example .env

# Edit .env with your values:
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key_here

# Start backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd apps/frontend

# Create environment file (optional)
# VITE_API_URL=http://localhost:5000
# VITE_SOCKET_URL=http://localhost:5000

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎯 Usage

### 1. Register/Login
- Navigate to `http://localhost:5173`
- Register with email, password, firstName, lastName
- Default role: `viewer` (can watch videos)
- Roles: `admin`, `editor`, `viewer`

### 2. Upload Video (Admin/Editor only)
- Click "Upload Video" on dashboard
- Drag & drop or select video file (max 100MB)
- Add title and description
- Watch progress bar during upload
- Processing starts automatically

### 3. Real-time Updates
- Dashboard updates in real-time via Socket.io
- See status changes: pending → processing → completed
- Sensitivity badges appear after processing
- No page refresh needed!

### 4. Watch Videos
- Click "Watch" on completed videos
- HTML5 player with native controls
- Seeking, volume, fullscreen support
- Token-authenticated streaming

### 5. Delete Videos
- Click "Delete" on your own videos
- Confirm deletion
- Soft delete (sets deletedAt timestamp)
- Only owner or admin can delete

## 🔌 Socket.io Features

### Event Queue System
- **Problem**: Socket disconnects during upload lose events
- **Solution**: Backend queues events per user, delivers on reconnect
- **Events**: `processing_started`, `processing_completed`

### Manual Reconnection
- Handles "transport close" disconnects
- Auto-reconnects after 500ms
- Guaranteed message delivery

## 🗄️ API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

### Videos
- `POST /api/videos/upload` - Upload video (multipart/form-data)
- `GET /api/videos/list` - List videos with filtering
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/:id/stream` - Stream video (token auth)
- `DELETE /api/videos/:id` - Soft delete video
- `POST /api/videos/:id/reprocess` - Reprocess (admin only)

## 🧪 Testing

### Test Socket.io Real-time Updates

1. Open browser DevTools → Console
2. Upload a video
3. Watch console for:
   ```
   🔌 Socket connected
   📹 Processing started event: {...}
   📹 Processing completed event: {...}
   ```
4. Video card updates automatically!

### Test Event Queue

1. Upload video
2. Immediately go offline (DevTools → Network → Offline)
3. Wait for processing to complete
4. Go back online
5. Events are delivered from queue!

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-256-bit-secret
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🏗️ Architecture Highlights

### ESM Migration
- Full ESM across backend, frontend, shared
- Backend uses `tsx` instead of `ts-node-dev`
- `type: "module"` in all package.json files
- Shared package: dual exports (ESM + CJS)

### Socket.io Design
- User-specific rooms (`user_${userId}`)
- Event queue Map for guaranteed delivery
- Transport upgrade: polling → websocket
- Manual reconnection for transport close

### Video Processing
- Simulated content analysis (5-second delay)
- Sensitivity scores: safe, flagged, review
- Confidence percentages (70-99%)
- Real-time status updates

### Security
- JWT token authentication
- Role-based authorization
- Token in query params for streaming
- Soft delete (never actually removes files)

## 🐛 Troubleshooting

### Socket.io not connecting
- Check backend is running on port 5000
- Verify JWT token in localStorage
- Check console for connection errors

### Video not streaming
- Ensure video processing is completed
- Check token authentication
- Verify file exists in uploads/ directory

### Build errors
- Rebuild shared package: `cd packages/shared && npm run build`
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npm run build`

## 📚 Key Learnings & Solutions

### Problems Faced

1. **Socket.io Transport Close Disconnects**
   - **Problem**: Browser connection pooling causes disconnects during uploads
   - **Solution**: Event queue + manual reconnection
   - **Documented in**: `ref-docs/problems-faced.md`

2. **Zod Version Mismatch**
   - **Problem**: Frontend v3 vs shared v4
   - **Solution**: Unified to Zod 4.1.13

3. **ESM Module Issues**
   - **Problem**: ts-node-dev doesn't support ESM properly
   - **Solution**: Migrated to tsx with `type: "module"`

4. **Double /api in URLs**
   - **Problem**: API service adds /api, routes also had /api
   - **Solution**: Remove /api prefix from route calls

## 🚀 Future Enhancements

- Video thumbnails generation
- Multiple quality options
- Playback speed control
- Video comments system
- Share functionality
- Admin analytics dashboard

## 👥 Roles & Permissions

| Role | Upload | View | Delete Own | Delete Any | Reprocess |
|------|--------|------|------------|------------|-----------|
| Viewer | ❌ | ✅ | ❌ | ❌ | ❌ |
| Editor | ✅ | ✅ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

Built with ❤️ using React, Express, MongoDB, and Socket.io
