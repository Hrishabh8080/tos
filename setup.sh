#!/bin/bash

echo "🚀 Starting TOS Products Management System Setup..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local and add your configuration."
    exit 1
fi

# Check if MongoDB is running
echo "📦 Checking MongoDB connection..."
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  Warning: MongoDB might not be running on localhost:27017"
    echo "   If using MongoDB Atlas, ignore this message."
fi

echo ""
echo "👤 Creating admin user..."
node server/scripts/createAdmin.js

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the backend: npm run server:dev"
echo "   2. Start the frontend: npm run dev"
echo "   Or run both together: npm run dev:all"
echo ""
echo "🌐 URLs:"
echo "   - Products Page: http://localhost:3000/products"
echo "   - Admin Login: http://localhost:3000/admin/login"
echo "   - Admin Dashboard: http://localhost:3000/admin/dashboard"
echo ""
echo "🔑 Default Admin Credentials:"
echo "   Email: admin@tos.com"
echo "   Password: admin123"
echo ""
