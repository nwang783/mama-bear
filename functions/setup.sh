#!/bin/bash

# Setup script for Firebase Functions development environment

echo "🔧 Setting up Firebase Functions development environment..."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
else
    echo "✓ Virtual environment already exists"
fi

# Activate venv
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt --quiet

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found!"
    echo "📝 Creating .env.local template..."
    echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
    echo ""
    echo "⚠️  Please edit .env.local and add your OpenAI API key"
else
    echo "✓ .env.local exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To activate the virtual environment, run:"
echo "  source venv/bin/activate"
echo ""
echo "To deploy functions, run:"
echo "  firebase deploy --only functions"
echo ""
