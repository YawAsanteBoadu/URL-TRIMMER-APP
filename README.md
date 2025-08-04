# URL Trimmer - Frontend Application

🚀 A modern, responsive frontend for the URL Trimmer application built with HTML, CSS, Bootstrap, and JavaScript. Features a clean design inspired by modern tech platforms with comprehensive URL shortening and management capabilities.

## ✨ Features

### Public Interface
- **Homepage**: Clean, modern landing page with URL shortening functionality
- **Instant URL Shortening**: Convert long URLs to short, shareable links
- **Custom Aliases**: Optional custom short codes for personalized links
- **Real-time Validation**: Client-side URL and alias validation
- **Copy to Clipboard**: One-click copying of shortened URLs
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Authentication System
- **User Registration**: Secure signup with password strength indicators
- **User Login**: Authentication with remember me functionality
- **Form Validation**: Real-time validation with helpful error messages
- **Password Toggle**: Show/hide password functionality
- **Social Login Ready**: Placeholder for Google and GitHub integration

### Authenticated Dashboard
- **Link Management**: Create, edit, delete, and organize shortened links
- **Analytics Dashboard**: View click statistics and performance metrics
- **Advanced Features**:
  - Password protection for links
  - Expiration date setting
  - Platform reference tracking
  - Custom platform logos
- **Search & Filter**: Find links quickly with search functionality
- **Bulk Operations**: Manage multiple links efficiently

### Redirect System
- **Smart Redirection**: Handles URL redirection with loading states
- **Password Protection**: Secure access to protected links
- **Error Handling**: Graceful handling of expired or invalid links
- **Click Tracking**: Records analytics data for link performance
- **Platform Display**: Shows source platform information

## 🏗️ Project Structure

```
├── index.html          # Homepage with URL shortening
├── login.html          # User authentication page
├── signup.html         # User registration page
├── dashboard.html      # Authenticated user dashboard
├── redirect.html       # URL redirection handler
├── styles.css          # Custom CSS styles and animations
├── script.js           # Homepage JavaScript functionality
├── auth.js             # Authentication JavaScript
├── dashboard.js        # Dashboard JavaScript
├── redirect.js         # Redirect page JavaScript
└── README.md           # Project documentation
```

## 🎨 Design System

### Color Palette
- **Primary**: `#2563eb` (Blue)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)
- **Dark**: `#1f2937` (Gray)

### Typography
- **Font Family**: Inter, system fonts
- **Headings**: Bold weights for hierarchy
- **Body Text**: Regular weight for readability

### Components
- **Cards**: Elevated with shadows and rounded corners
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with validation states
- **Navigation**: Responsive with mobile-friendly collapsing

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Web server (for proper CORS handling) or local development server

### Installation

1. **Clone or Download**: Get the project files
2. **Open in Browser**: 
   - For development: Open `index.html` directly
   - For production: Serve through a web server

### Local Development Server

Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js:
```bash
npx serve .
```

Using PHP:
```bash
php -S localhost:8000
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Configuration

### API Integration
The frontend is designed to work with a backend API. Update the following files to connect to your backend:

1. **script.js**: Update `simulateApiCall()` function
2. **auth.js**: Update `simulateLogin()` and `simulateSignup()` functions
3. **dashboard.js**: Update `simulateCreateLink()` function
4. **redirect.js**: Update `getLinkData()` and related functions

### Environment Variables
For production deployment, configure:
- API endpoint URLs
- Authentication providers (Google, GitHub)
- Analytics tracking codes
- CDN URLs for assets

## 🎯 Key Features Implementation

### URL Shortening Flow
1. User enters long URL
2. Optional custom alias input
3. Client-side validation
4. API call to backend
5. Display shortened URL
6. Copy to clipboard functionality

### Authentication Flow
1. User registration/login forms
2. Client-side validation
3. Password strength checking
4. API authentication
5. Session management
6. Redirect to dashboard

### Dashboard Features
1. Statistics display with animations
2. Link creation modal
3. Link management table
4. Search and filtering
5. Analytics modal
6. Platform logo selection

### Redirect Handling
1. Extract short code from URL
2. API call to get link data
3. Password protection check
4. Click tracking
5. Redirect to original URL

## 🔒 Security Features

- **Input Validation**: Client-side validation for all forms
- **XSS Prevention**: Proper input sanitization
- **HTTPS Ready**: Designed for secure connections
- **Password Protection**: Secure link access
- **Domain Blacklisting**: Prevent malicious URLs

## 🎨 Customization

### Styling
- Edit `styles.css` for custom styling
- Modify CSS variables in `:root` for theme changes
- Update Bootstrap classes for layout modifications

### Branding
- Replace logo and brand name in navigation
- Update color scheme in CSS variables
- Modify footer and branding elements

### Features
- Add new platform integrations
- Extend analytics capabilities
- Implement additional link options

## 📊 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🔄 API Integration Points

The frontend expects the following API endpoints:

### Public Endpoints
- `POST /api/shorten` - Create short URL
- `GET /api/redirect/:code` - Get redirect data

### Authenticated Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/links` - User's links
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `GET /api/links/:id/analytics` - Link analytics

## 🚀 Deployment

### Static Hosting
Deploy to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### CDN Integration
For better performance:
- Use CDN for Bootstrap and Font Awesome
- Optimize images and assets
- Enable gzip compression

## 🧪 Testing

### Manual Testing Checklist
- [ ] URL shortening functionality
- [ ] Form validation on all pages
- [ ] Responsive design on different devices
- [ ] Authentication flow
- [ ] Dashboard operations
- [ ] Redirect handling
- [ ] Error states and edge cases

### Cross-browser Testing
Test on all supported browsers and devices.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Bootstrap for the responsive framework
- Font Awesome for icons
- Modern CSS techniques for animations
- Inspiration from leading tech platforms

---

**Built with ❤️ for the URL Trimmer project**
