#!/bin/bash

# Wedding Venue Comparer - Web Version Quick Start

echo "🚀 Wedding Venue Comparer - Web Setup"
echo "======================================"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env not found. Creating from template..."
  cp backend/.env.example backend/.env
  echo "   ✓ Created backend/.env - Please fill in Firebase credentials"
fi

if [ ! -f "frontend/.env" ]; then
  echo "⚠️  frontend/.env not found. Creating from template..."
  cp frontend/.env.example frontend/.env
  echo "   ✓ Created frontend/.env - Please fill in Firebase config"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend
echo "Installing backend..."
cd backend
npm install
cd ..

# Install frontend
echo "Installing frontend..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 NEXT STEPS:"
echo "1. Edit backend/.env with Firebase service account credentials"
echo "2. Edit frontend/.env with Firebase web config"
echo "3. Run in two terminals:"
echo "   Terminal 1: cd web/backend && npm run dev"
echo "   Terminal 2: cd web/frontend && npm start"
echo ""
echo "For detailed setup instructions, see web/SETUP_GUIDE.md"
