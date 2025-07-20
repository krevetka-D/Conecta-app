#!/bin/bash
# frontend/setup.sh

echo "🚀 Setting up Conecta Alicante Frontend..."

# Clean up
echo "🧹 Cleaning up old files..."
rm -rf node_modules
rm -rf .expo
rm -rf dist
rm -rf web-build
rm -f package-lock.json
rm -f yarn.lock

# Clear caches
echo "🗑️ Clearing caches..."
npm cache clean --force

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p scripts
mkdir -p web

# Copy index.html if it doesn't exist
if [ ! -f "web/index.html" ]; then
    echo "📄 Creating web/index.html..."
    cat > web/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Conecta Alicante</title>
    <style>
        html, body {
            overflow: hidden;
            margin: 0;
            padding: 0;
            height: 100%;
            background-color: #f3f4f6;
        }
        #root {
            display: flex;
            height: 100%;
            width: 100%;
        }
    </style>
</head>
<body>
    <div id="root"></div>
</body>
</html>
EOF
fi

# Run postinstall script
if [ -f "scripts/fix-metro.js" ]; then
    echo "🔧 Running metro fixes..."
    node scripts/fix-metro.js
fi

echo "✅ Setup complete!"
echo ""
echo "To run the app:"
echo "  - Web: npm run web"
echo "  - iOS: npm run ios"
echo "  - Android: npm run android"
echo ""
echo "Make sure your backend is running on port 5001!"