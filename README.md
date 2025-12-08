# Total Office Solutions - Products Management System

A comprehensive full-stack e-commerce platform built with Next.js, Express, MongoDB, and Cloudinary.

## 🚀 Quick Start

```bash
# 1. Install dependencies (already done)
npm install

# 2. Configure environment
# Edit .env.local with your MongoDB and Cloudinary credentials

# 3. Run setup
./setup.sh

# 4. Start the application
npm run dev:all
```

**Access the application:**
- 🛍️ Products Page: http://localhost:3000/products
- 👨‍💼 Admin Login: http://localhost:3000/admin/login
- 📊 Admin Dashboard: http://localhost:3000/admin/dashboard

**Default Admin Credentials:**
- Email: `admin@tos.com`
- Password: `admin123`

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Fast setup guide (5 minutes)
- **[PRODUCTS_SETUP.md](./PRODUCTS_SETUP.md)** - Comprehensive documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete feature list
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture & diagrams

## ✨ Features

### 🛍️ User Features
- Browse products with beautiful UI
- Filter by categories
- Search functionality
- Responsive design (mobile, tablet, desktop)
- Featured product badges
- Stock status indicators
- Product specifications display

### 👨‍💼 Admin Features
- Secure authentication (JWT)
- Full CRUD for products and categories
- Upload multiple product images
- Add dynamic specifications
- Set featured products
- Manage stock levels
- Category-based organization
- Real-time updates

### 🔧 Technical Features
- RESTful API architecture
- MongoDB database
- Cloudinary image storage
- JWT authentication
- Password hashing
- CORS enabled
- Image optimization
- Clean code structure

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.1.3** - React framework
- **React 19** - UI library
- **CSS Modules** - Styling

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Cloudinary** - Image storage
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📁 Project Structure

```
tos/
├── app/                    # Next.js pages
│   ├── admin/             # Admin dashboard & login
│   ├── products/          # User products page
│   └── ...
├── server/                # Express backend
│   ├── config/           # DB & Cloudinary config
│   ├── models/           # Mongoose models
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth middleware
│   └── scripts/          # Utility scripts
├── components/           # React components
├── .env.local           # Configuration
└── package.json         # Dependencies
```

## 🔧 Available Scripts

```bash
npm run dev              # Start Next.js frontend
npm run server:dev       # Start Express backend
npm run dev:all          # Start both (recommended)
npm run build            # Build for production
npm start                # Production server
```

## 📦 API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `GET /api/products?category=:id` - Filter by category
- `GET /api/products?search=:term` - Search products

### Admin (Auth Required)
- `POST /api/auth/login` - Admin login
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 🔐 Environment Variables

Required in `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@tos.com
ADMIN_PASSWORD=admin123
PORT=3001
```

## 🎯 Getting Started

### Prerequisites
- Node.js 16+
- **MongoDB Atlas account** (free tier - recommended) - [Setup Guide](./MONGODB_ATLAS_GUIDE.md)
- Cloudinary account (free tier)

### Installation

1. **Setup MongoDB Atlas** (Recommended - 5 minutes)
   - Follow the detailed guide: [MONGODB_ATLAS_GUIDE.md](./MONGODB_ATLAS_GUIDE.md)
   - Or use local MongoDB:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   brew services start mongodb-community@7.0
   ```

2. **Setup Cloudinary**
   - Sign up at cloudinary.com
   - Get credentials from dashboard
   - Update .env.local

3. **Initialize Admin**
   ```bash
   node server/scripts/createAdmin.js
   ```

4. **Start Application**
   ```bash
   npm run dev:all
   ```

## 📸 Screenshots

### Products Page
Beautiful, responsive product catalog with category filtering and search.

### Admin Dashboard
Intuitive interface for managing products and categories with image upload.

## 🔒 Security

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Protected admin routes
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Input validation

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway/Heroku)
```bash
# Set environment variables
# Deploy from GitHub
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
brew services start mongodb-community
```

### Port Already in Use
```bash
# Kill process
lsof -ti:3001 | xargs kill -9
```

### Admin Login Failed
```bash
# Create admin user
node server/scripts/createAdmin.js
```

## 📝 License

This project is for educational/commercial use.

## 🤝 Contributing

Contributions welcome! Please read documentation before submitting PRs.

## 📧 Support

For issues or questions, check the documentation files or create an issue.

---

**Built with ❤️ using Next.js, Express, MongoDB & Cloudinary**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
