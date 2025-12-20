# Event Planner Backend

Node.js Express backend API for the Event Planner application.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**
   - Create the database using phpMyAdmin or MySQL command line
   - Run the SQL script: `database/schema.sql`
   - This will create the `events_db` database and required tables

3. **Environment Configuration**
   - Copy `.env.example` to `.env` (already created with your keys)
   - Update database credentials if needed:
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=events_db
     ```

4. **Start the Server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Registrations
- `GET /api/events/:eventId/registrations` - Get registrations for event
- `POST /api/events/:eventId/register` - Register user for event
- `DELETE /api/events/:eventId/unregister` - Unregister user from event

### AI Generation
- `POST /api/ai/generate-description` - Generate event description
- `POST /api/ai/generate-image` - Generate event image

## Health Check
- `GET /api/health` - Check server status

# Event Management System with Role-Based Authentication

Complete authentication system with three user roles: User, President, and Admin.

## Features

### User Roles
- **User**: Can view events and register/attend events
- **President**: Can create/edit/delete own events, use AI features (text & image generation)
- **Admin**: Full dashboard with statistics, manage all events, view all users

### Authentication
- Plain text passwords (for university project as requested)
- JWT-like token authentication
- Role-based access control

### AI Features (President & Admin only)
- Generate event descriptions using OpenAI
- Generate event images using Gemini API (with DALL-E fallback)
- Images saved to backend/images folder with file references in database

### Admin Dashboard
- Statistics cards (total events, upcoming events, registrations, users by role)
- Event management table with delete functionality
- User list with role badges

## Setup Instructions

### 1. Database Setup

```bash
# Run the SQL schema
mysql -u root -p < database/schema.sql
```

This creates:
- `users` table with role ENUM (user, president, admin)
- `events` table with creator tracking and image_path
- `registrations` table with user_id foreign keys
- Sample admin and president users

**Default Accounts:**
- Admin: `admin@university.edu` / `admin123`
- President: `president@university.edu` / `president123`

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=events_db
PORT=5000
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
```

Start server:
```bash
npm start
```

Server runs on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Application runs on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (role: 'user')
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Events
- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get event details (public)
- `POST /api/events` - Create event (president, admin)
- `PUT /api/events/:id` - Update event (owner or admin)
- `DELETE /api/events/:id` - Delete event (owner or admin)

### Registrations
- `GET /api/events/:eventId/registrations` - Get registrations
- `POST /api/events/:eventId/register` - Register for event (authenticated)
- `DELETE /api/events/:eventId/unregister` - Unregister (authenticated)

### AI (President & Admin only)
- `POST /api/ai/generate-description` - Generate event description
- `POST /api/ai/generate-image` - Generate event image

### Admin (Admin only)
- `GET /api/admin/statistics` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/events` - All events with creator info

## Role-Based Access

### Public Access
- View events
- Login/Signup

### User Role
- All public access features
- Register/unregister for events

### President Role
- All user features
- Create new events
- Edit/delete own events
- Use AI text generation
- Use AI image generation
- Images saved to backend/images with references in DB

### Admin Role
- All president features
- Edit/delete any event
- View dashboard statistics
- View all users
- Manage all events from admin panel

## Technology Stack

**Backend:**
- Node.js + Express
- MySQL
- OpenAI API (text & image)
- Google Gemini API (image)

**Frontend:**
- React
- React Router
- Tailwind CSS
- Context API for auth state

## File Structure

```
backend/
├── images/              # AI-generated images
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── eventController.js
│   ├── registrationController.js
│   ├── aiController.js
│   └── adminController.js
├── middleware/
│   └── auth.js         # Authentication & authorization
├── routes/
│   ├── auth.js
│   ├── events.js
│   ├── registrations.js
│   ├── ai.js
│   └── admin.js
└── server.js

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.js
│   ├── Components/
│   │   ├── Common/
│   │   │   └── Navbar/
│   │   └── ProtectedRoute.js
│   ├── Pages/
│   │   ├── Login/
│   │   ├── Signup/
│   │   ├── Events/
│   │   └── Admin/
│   └── services/
│       └── api.js
```

## Notes

- Passwords stored as plain text (as requested for university project)
- Admin/President accounts must be added manually to database
- Regular users sign up through the interface
- Images stored in backend/images folder with paths in database
- Tailwind CSS used for simple, clean styling
