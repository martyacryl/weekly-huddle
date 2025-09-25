# Marriage Meeting Tool
<!-- Updated deployment --> - Modern Version

A comprehensive web application for couples to plan their weekly activities, manage shared goals, and strengthen their relationship through intentional planning and communication.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure Sign-In**: Email/password authentication via Neon PostgreSQL
- **User Isolation**: Each user only sees their own data
- **Admin Panel**: Create, manage, and delete user accounts
- **Role-Based Access**: Different interfaces for regular users and administrators

### 📅 Weekly Planning
- **7-Day Schedule**: Plan activities for each day of the week
- **Dynamic Lists**: Add/remove schedule items as needed
- **Week Navigation**: Navigate between different weeks
- **Auto-Save**: Real-time saving with debounced updates

### 📋 Multiple List Types
- **To-Do List**: Tasks and action items
- **Prayer List**: Spiritual requests and prayers
- **Goals**: Dreams and aspirations
- **Grocery List**: Shopping and supplies
- **Unconfessed Sin**: Accountability and grace
- **Weekly Winddown**: Relaxation activities together

### 💾 Data Persistence
- **Neon PostgreSQL**: Cloud database with user isolation
- **Real-time Sync**: Automatic saving with debounced updates
- **Cross-device Sync**: Data available across all devices
- **Row Level Security**: Database-level user isolation

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful Gradients**: Modern color schemes and visual appeal
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Clear visual hierarchy and intuitive navigation

## 🚀 Quick Start

### 1. Database Setup

1. Connect to your Neon PostgreSQL database:
```bash
psql 'postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

2. Run the database setup script:
```sql
\i setup_marriage_database.sql
```

3. Create your admin user account in the users table

### 2. Environment Configuration

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
VITE_NEON_CONNECTION_STRING=postgresql://neondb_owner:npg_JVaULlB0w8mo@ep-soft-rice-adn6s9vn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
VITE_TABLE_NAME=marriage_meetings
VITE_DEBUG_LOGGING=true
```

### 3. Installation

```bash
# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Start development server
npm run dev
```

### 4. Deploy

1. Build the application:
```bash
npm run build
```

2. Deploy to Vercel or your preferred hosting service
3. Set environment variables in your hosting platform
4. Test authentication and user management

## 🔧 Technical Details

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **Zustand**: State management
- **Vite**: Fast build tool

### Backend
- **Express.js**: Node.js web framework
- **Neon PostgreSQL**: Cloud database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Row Level Security**: User data isolation

### Data Flow
1. **User Input** → React state update
2. **Debounced Save** → Neon PostgreSQL database
3. **Data Loading** → Database query with user filtering
4. **User Isolation** → RLS policies ensure data privacy

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Marriage Meetings Table
```sql
CREATE TABLE marriage_meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL,  -- Format: 'YYYY-MM-DD' (Monday of week)
  data_content JSONB NOT NULL,     -- Complete week data structure
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_key)
);
```

## 🛡️ Security Features

### Authentication
- **JWT Tokens**: Secure authentication
- **Password Hashing**: bcryptjs for password security
- **Session Management**: Automatic token handling

### Data Privacy
- **Row Level Security**: Database-level user isolation
- **User ID Validation**: All queries filtered by user
- **Admin Override**: Administrators can access all data

### API Security
- **Token Verification**: All API routes protected
- **User Validation**: Requests validated against user ID
- **Error Handling**: Secure error messages

## 📱 Usage Guide

### For Couples
1. **Sign In**: Use your email and password
2. **Plan Your Week**: Add activities to each day
3. **Manage Lists**: Create and track shared goals
4. **Stay Organized**: Keep everything in one place

### For Administrators
1. **Admin Mode**: Access user management panel
2. **Create Accounts**: Add new user accounts
3. **Monitor System**: Track user activity and system status
4. **User Support**: Help users with account issues

## 🔄 Development Workflow

### Local Development
1. Clone the repository
2. Set up Neon PostgreSQL database
3. Run database setup scripts
4. Configure environment variables
5. Start development servers

### Production Deployment
1. Update production database credentials
2. Run production database setup
3. Deploy to hosting service
4. Test all functionality in production

## 🐛 Troubleshooting

### Common Issues
- **"User not found"**: Check if user exists in database
- **Data not saving**: Verify database connection and RLS policies
- **Authentication errors**: Check email/password and user status
- **Build errors**: Verify TypeScript types and imports

### Debug Steps
1. Check browser console for errors
2. Verify database connection status
3. Check database policies and RLS
4. Confirm user metadata and permissions

## 📈 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Live updates between users
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Usage insights and progress tracking
- **Integration**: Calendar and task app connections
- **Notifications**: Email/SMS reminders and updates

### Technical Improvements
- **TypeScript**: Enhanced type safety
- **Unit Testing**: Comprehensive test coverage
- **Performance**: Further optimization and caching
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **React Hooks**: Use functional components and hooks
- **TypeScript**: Maintain type safety
- **Tailwind CSS**: Follow utility-first approach
- **Error Handling**: Implement proper error boundaries
- **Documentation**: Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Neon**: Cloud PostgreSQL database
- **Tailwind CSS**: Beautiful and responsive styling
- **React Team**: Amazing frontend framework
- **Open Source Community**: Inspiration and support

---

Built with ❤️ for strengthening marriages through intentional planning and communication.# Reverted to working state
