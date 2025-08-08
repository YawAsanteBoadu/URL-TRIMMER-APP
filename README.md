# URL Shortener Backend API

A robust, scalable URL shortener service built with Node.js, PostgreSQL, and Redis. Features include URL shortening, custom aliases, expiration dates, password protection, click analytics, and user authentication.

## ✨ Features

- 🔗 **URL Shortening**: Convert long URLs into short, shareable links
- 👤 **User Authentication**: JWT-based authentication system
- 🎯 **Custom Aliases**: Create personalized short codes
- ⏰ **Link Expiration**: Set expiration dates for links
- 🔒 **Password Protection**: Secure links with passwords
- 📊 **Click Analytics**: Track click counts and statistics
- 🚀 **Redis Caching**: High-performance caching for fast redirections
- 🛡️ **Security**: Rate limiting, input validation, and security headers
- 📱 **CORS Support**: Cross-origin requests enabled for frontend integration

## 🏗️ Architecture

- **Language**: Node.js with Express.js
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis for performance optimization
- **Authentication**: JWT tokens
- **Security**: Helmet, rate limiting, input validation
- **Pattern**: MVC (Model-View-Controller)

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd url-shortener-backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/url_shortener

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Application Configuration
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

### 3. Database Setup

Create PostgreSQL database and run migrations:

```bash
# Create database
createdb url_shortener

# Run database migration
npm run migrate
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### URL Management

#### Shorten URL (Public)
```http
POST /api/shorten
Content-Type: application/json

{
  "original_url": "https://example.com/very/long/url",
  "custom_alias": "my-link" // optional
}
```

#### Create URL (Authenticated - Full Features)
```http
POST /api/links
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "original_url": "https://example.com/very/long/url",
  "custom_alias": "my-link", // optional
  "expires_at": "2024-12-31T23:59:59Z", // optional
  "password": "secret123", // optional
  "platform_reference": "mobile-app" // optional
}
```

#### Get User URLs
```http
GET /api/links?page=1&limit=20
Authorization: Bearer <jwt_token>
```

#### Get URL Analytics
```http
GET /api/analytics/:short_code
Authorization: Bearer <jwt_token>
```

#### Delete URL
```http
DELETE /api/links/:short_code
Authorization: Bearer <jwt_token>
```

### URL Redirection

#### Redirect to Original URL
```http
GET /:short_code?password=secret123
```

For password-protected links, include the password as a query parameter.

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Joi schema validation for all inputs
- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Security Headers**: Helmet middleware for security headers
- **CORS Protection**: Configurable cross-origin resource sharing
- **URL Blacklist**: Prevents shortening of malicious URLs

## 📊 Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### URLs Table
```sql
urls (
  id UUID PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias VARCHAR(50) UNIQUE,
  expires_at TIMESTAMP,
  password_hash VARCHAR(255),
  click_count INTEGER DEFAULT 0,
  platform_reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id UUID REFERENCES users(id)
)
```

## 🚀 Performance Optimizations

- **Redis Caching**: Frequently accessed URLs cached for fast redirection
- **Database Indexing**: Optimized indexes for quick lookups
- **Connection Pooling**: PostgreSQL connection pooling for efficiency
- **Async Operations**: Non-blocking operations throughout the application

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📦 Deployment

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@db-host:5432/db_name
REDIS_URL=redis://redis-host:6379
JWT_SECRET=your-production-secret
BASE_URL=https://yourdomain.com
```

## 🛠️ Development

### Project Structure

```
src/
├── controllers/         # Request handlers
│   ├── authController.js
│   └── urlController.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── security.js
├── models/              # Database models
│   ├── User.js
│   └── Url.js
├── routes/              # Route definitions
│   ├── auth.js
│   ├── urls.js
│   ├── redirect.js
│   └── index.js
├── database/            # Database configuration
│   ├── connection.js
│   ├── migrate.js
│   └── schema.sql
├── cache/               # Redis caching
│   └── redisClient.js
└── server.js            # Application entry point
```

### Adding New Features

1. Create model in `src/models/`
2. Add controller in `src/controllers/`
3. Define routes in `src/routes/`
4. Add validation schemas in `src/middleware/security.js`
5. Update database schema if needed

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL is correct
   - Ensure database exists

2. **Redis Connection Failed**
   - Redis is optional but recommended
   - Check REDIS_URL configuration
   - App will work without Redis

3. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token format in Authorization header

### Logs

Enable debug logging:

```bash
DEBUG=url-shortener:* npm run dev
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples

---

**Happy URL Shortening! 🔗✨**
