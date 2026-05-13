# STRAK - Premium Random Video Chat Platform

A modern, real-time random video chat application built with cutting-edge technologies. Connect with strangers worldwide with advanced gender filtering, premium features, and intelligent matching.

## 🚀 Features

### Core Features
- **Real-time Video Chat**: WebRTC-powered P2P video connections
- **Gender-based Matching**: Filter matches by gender preferences (Any/Male/Female/Other)
- **Text Messaging**: In-room chat during video calls
- **User Reporting**: Report inappropriate behavior with admin review
- **Skip Functionality**: Move to next user instantly
- **Online User Counter**: Real-time global user count

### Premium Features
- **Profile Customization**: Interests, bio, and personal details
- **Advanced Matching**: Interest-based compatibility scoring
- **Priority Queue**: Premium users get faster matches
- **HD Video Quality**: Enhanced video streaming
- **Premium Rooms**: Exclusive chat environments

### Admin Panel
- **Analytics Dashboard**: User statistics and gender distribution
- **Report Management**: Review and resolve user reports
- **User Moderation**: Ban/unban users by ID or username
- **Real-time Stats**: Live user metrics and activity monitoring

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.io-client** - Real-time communication
- **Simple-peer** - WebRTC wrapper
- **Zustand** - State management
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Winston** - Logging framework
- **Joi** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
strak-omegle/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utilities (axios, etc.)
│   │   ├── socket/       # Socket.io client setup
│   │   └── store/        # Zustand stores
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── sockets/      # Socket.io handlers
│   │   └── utils/        # Helpers (logger, validation)
├── admin-panel/           # Admin dashboard (future)
├── docs/                  # Documentation
└── shared/                # Shared utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/strak-omegle.git
   cd strak-omegle
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/strak
JWT_SECRET=your-super-secret-jwt-key
ADMIN_KEY=your-admin-promotion-key
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

## 🔐 Authentication & Security

- **JWT-based Authentication**: Secure token-based auth with 7-day expiration
- **Password Hashing**: bcryptjs with salt rounds
- **Input Validation**: Joi schemas for all endpoints
- **Rate Limiting**: 200 requests per 15 minutes
- **CORS Protection**: Configured origins only
- **Helmet Security**: Security headers middleware
- **Admin Protection**: Role-based access control

## 📡 Real-time Architecture

### Socket.io Events
- `join-queue` - Enter matching queue with preferences
- `match-found` - Receive matched user details
- `webrtc-signal` - Exchange WebRTC signaling data
- `send-message` / `receive-message` - Text communication
- `report-user` - Submit user reports
- `end-chat` - Terminate current session

### WebRTC Flow
1. User joins queue with gender preference
2. Server finds compatible match
3. WebRTC peer connection established
4. Direct P2P video stream
5. Signaling through Socket.io

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/promote-admin` - Promote user to admin

### Admin (Protected)
- `GET /api/admin/stats` - Admin statistics
- `GET /api/admin/reports` - List reports
- `PATCH /api/admin/reports/:id/status` - Update report status
- `DELETE /api/admin/reports/:id` - Delete report
- `PATCH /api/admin/users/:id/ban` - Ban user by ID
- `PATCH /api/admin/users/:id/unban` - Unban user by ID

## 🗄️ Database Models

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  gender: Enum ['male', 'female', 'other'],
  interests: [String],
  bio: String,
  premium: Boolean,
  verified: Boolean,
  role: Enum ['user', 'admin'],
  isBanned: Boolean,
  bannedReason: String,
  bannedAt: Date
}
```

### Report
```javascript
{
  reporterUserId: ObjectId,
  reportedUserId: ObjectId,
  roomId: String,
  reason: String,
  status: Enum ['pending', 'reviewed', 'resolved']
}
```

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Code Quality
- **ESLint**: Configured for code linting
- **TypeScript**: Strict type checking
- **Prettier**: Code formatting (recommended)

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB
- [ ] Set strong `JWT_SECRET` and `ADMIN_KEY`
- [ ] Enable HTTPS/SSL
- [ ] Configure reverse proxy (nginx)
- [ ] Setup process manager (PM2)
- [ ] Configure log rotation
- [ ] Setup monitoring (optional)

### Docker Support (Future)
```dockerfile
# Planned for future releases
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by random chat platforms
- Community-driven development

---

**Made with ❤️ for connecting people worldwide**