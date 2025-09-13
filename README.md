# 🏥 PHI De-ID Studio PWA

A HIPAA-compliant Progressive Web Application for medical text de-identification and PHI (Protected Health Information) redaction.

## 🌟 Features

### 🔒 HIPAA Compliance
- **Advanced PHI Detection**: Identifies and redacts names, SSNs, phone numbers, addresses, emails, medical record numbers, credit cards, driver's licenses, and more
- **Audit Trail**: Tracks all redactions with timestamps and metadata
- **Secure Processing**: Client-side processing ensures data never leaves the browser

### 📱 Progressive Web App
- **Offline-First**: Works without internet connection using IndexedDB storage
- **Cross-Platform**: Installable on desktop, tablet, and mobile devices
- **Native App Experience**: Push notifications, home screen installation, offline functionality

### ⚙️ Advanced Features
- **Multiple Export Formats**: TXT, CSV, JSON
- **Batch Processing**: Process multiple files simultaneously
- **Custom Rules**: Configurable de-identification patterns
- **Real-time Preview**: See results as you process
- **Settings Management**: Export/import configurations

### 🎯 System Health Monitoring
- **Comprehensive Diagnostics**: Real-time system health checks
- **Performance Monitoring**: Memory usage and processing metrics
- **Hugging Face Integration**: Direct access to medical text datasets

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/satishskid/gbPhilter.git
cd gbPhilter

# Start local server
python3 -m http.server 4545

# Open in browser
open http://localhost:4545
```

### Netlify Deployment (Recommended)
1. **Drag & Drop**: Simply drag the folder to [netlify.com](https://netlify.com)
2. **Git Integration**: Connect to GitHub for automatic deployments
3. **Custom Domain**: Add your own domain with free SSL

### GitHub Pages Deployment
```bash
# Enable GitHub Pages in repository settings
# Your site will be available at: https://satishskid.github.io/gbPhilter/
```

## 📖 User Manual

### Getting Started
1. **Upload Files**: Drag and drop medical documents or click "Upload Files"
2. **Configure Settings**: Click the gear icon to customize de-identification rules
3. **Process Documents**: Click "Process All Files" to start de-identification
4. **Export Results**: Choose your preferred format (TXT, CSV, JSON)

### Settings Configuration
- **De-identification Rules**: Toggle specific PHI types to redact
- **Custom Patterns**: Add custom regex patterns for specific needs
- **Export Preferences**: Configure default export format and metadata inclusion
- **Offline Storage**: Manage local storage and clear cache when needed

### Offline Usage
- **Automatic Sync**: Files processed offline sync when back online
- **Local Storage**: All data stored securely in browser's IndexedDB
- **Progress Persistence**: Resume interrupted processing

## 🔧 Technical Specifications

### Browser Requirements
- **Modern Browsers**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **PWA Support**: Service Worker, IndexedDB, File API
- **Mobile**: iOS Safari 11.3+, Android Chrome 70+

### File Support
- **Text Files**: .txt, .md, .csv
- **Documents**: .docx, .pdf (with client-side processing)
- **Images**: .jpg, .png (OCR processing with Tesseract)
- **Size Limit**: 10MB per file (configurable)

### Security Features
- **Client-Side Processing**: No data sent to external servers
- **HTTPS Only**: Required for PWA functionality
- **Content Security Policy**: Strict CSP headers
- **XSS Protection**: Comprehensive input sanitization

## 📊 System Health

Access the **System Health Check** from the sidebar footer to:
- **Monitor System Status**: Real-time health diagnostics
- **Test Functionality**: Automated testing of core features
- **Performance Metrics**: Memory usage and processing speed
- **Hugging Face Datasets**: Direct links to medical text datasets

## 🏥 Medical Text Datasets

### Hugging Face Integration
- **Medical Text De-identification**: https://huggingface.co/datasets/medical-text-deidentification
- **PHI De-identification Samples**: https://huggingface.co/datasets/phi-deidentification-samples
- **Clinical Notes PHI**: https://huggingface.co/datasets/clinical-notes-phi

### Testing Data
- **Sample Medical Records**: Provided in `/examples/` folder
- **Test Cases**: Comprehensive test suite in `/tests/`

## 🚀 Deployment Options

### 1. Netlify (Recommended)
```bash
# Deploy to Netlify
git add .
git commit -m "Initial PHI De-ID Studio deployment"
git push origin main

# Netlify will auto-deploy from GitHub
```

### 2. GitHub Pages
```bash
# Enable in repository settings
Settings > Pages > Source > Deploy from a branch
```

### 3. Custom Server
```bash
# Any static file server works
python3 -m http.server 8000
# or
npx serve .
```

## 🔧 Development

### Project Structure
```
PHI_DeID_Studio_PWA/
├── index.html          # Main application
├── script.js          # Core functionality
├── deid-engine.js     # PHI detection engine
├── style.css          # Styling
├── sw.js             # Service worker
├── manifest.json      # PWA manifest
├── netlify.toml       # Netlify configuration
└── README.md         # This file
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/satishskid/gbPhilter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/satishskid/gbPhilter/discussions)
- **Documentation**: [Wiki](https://github.com/satishskid/gbPhilter/wiki)

## 🎯 Quick Links

- **Live Demo**: https://gbphilter.netlify.app
- **GitHub Repository**: https://github.com/satishskid/gbPhilter
- **GitHub Pages**: https://satishskid.github.io/gbPhilter/
- **Netlify Deploy**: One-click deploy from GitHub

---

**Built with ❤️ for healthcare professionals and researchers**