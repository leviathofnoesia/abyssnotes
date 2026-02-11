#!/bin/bash

# AbyssNotes One-Command Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/leviathofnoesia/abyssnotes/main/install.sh | bash

set -e

echo "🦞 Installing AbyssNotes..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "   Install it from https://nodejs.org/"
    exit 1
fi

# Create temp directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

# Download and extract
echo "📥 Downloading AbyssNotes..."
if command -v wget &> /dev/null; then
    wget -qO abyssnotes.tar.gz https://github.com/leviathofnoesia/abyssnotes/archive/refs/heads/main.tar.gz
else
    curl -fsSL https://github.com/leviathofnoesia/abyssnotes/archive/refs/heads/main.tar.gz -o abyssnotes.tar.gz
fi

# Extract
echo "📦 Extracting..."
tar -xzf abyssnotes.tar.gz
cd abyssnotes-main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

# Create installation directory
INSTALL_DIR="$HOME/.abyssnotes"
mkdir -p "$INSTALL_DIR"

# Copy files
echo "📁 Installing to $INSTALL_DIR..."
cp -r . "$INSTALL_DIR/"

# Create symlink for CLI
echo "🔗 Creating CLI command..."
chmod +x "$INSTALL_DIR/abyssnotes.js"
ln -sf "$INSTALL_DIR/abyssnotes.js" /usr/local/bin/abyssnotes 2>/dev/null || true

# Create desktop entry (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🖥️  Creating desktop entry..."
    mkdir -p "$HOME/.local/share/applications"
    cat > "$HOME/.local/share/applications/abyssnotes.desktop" <<EOF
[Desktop Entry]
Name=AbyssNotes
Comment=Local-first personal knowledge base
Exec=bash -c "cd $INSTALL_DIR && npm start"
Icon=$INSTALL_DIR/public/icon.png
Terminal=false
Type=Application
Categories=Utility;Office;
EOF
fi

# Clean up
cd ~
rm -rf "$TEMP_DIR"

echo ""
echo "✅ AbyssNotes installed successfully!"
echo ""
echo "   Start with: abyssnotes start"
echo "   Or:       cd ~/.abyssnotes && npm start"
echo ""
echo "   Open browser: http://localhost:3000"
echo ""
