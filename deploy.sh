#!/bin/bash

# PHI De-ID Studio Deployment Script
# This script prepares the application for deployment to Netlify and GitHub Pages

echo "🚀 Preparing PHI De-ID Studio for deployment..."

# Create deployment directory
mkdir -p dist

# Copy all necessary files
echo "📁 Copying files..."
cp index.html dist/
cp style.css dist/
cp script.js dist/
cp deid-engine.js dist/
cp sw.js dist/
cp manifest.json dist/
cp netlify.toml dist/
cp README.md dist/
cp USER_MANUAL.md dist/
cp LICENSE dist/
cp .gitignore dist/

# Create examples directory with sample files
mkdir -p dist/examples
echo "John Doe, SSN: 123-45-6789, DOB: 01/15/1975, Phone: (555) 123-4567, Address: 123 Main St, Anytown, NY 12345" > dist/examples/sample_medical_record.txt
echo "Patient: Jane Smith, MRN: 987654321, Insurance: ABC123456789, Doctor: Dr. Robert Johnson" > dist/examples/sample_clinical_note.txt

# Create assets directory for any images or additional resources
mkdir -p dist/assets

# Optimize for production (minify if possible)
echo "⚡ Optimizing for production..."

# Create a simple build info file
echo "Build Date: $(date)" > dist/BUILD_INFO.txt
echo "Version: 1.0.0" >> dist/BUILD_INFO.txt
echo "Environment: Production" >> dist/BUILD_INFO.txt

# Verify all files are present
echo "✅ Verifying deployment files..."
ls -la dist/

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📦 Deployment Options:"
echo "1. Netlify: Drag the 'dist' folder to netlify.com"
echo "2. GitHub Pages: Push to gh-pages branch"
echo "3. Manual: Upload 'dist' contents to your server"
echo ""
echo "🔗 Quick Deploy Links:"
echo "   Netlify: https://app.netlify.com/drop"
echo "   GitHub:  https://github.com/satishskid/gbPhilter/settings/pages"
echo ""
echo "📖 Documentation:"
echo "   README.md: Complete project documentation"
echo "   USER_MANUAL.md: Detailed user guide"