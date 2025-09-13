# 📖 PHI De-ID Studio User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Uploading Documents](#uploading-documents)
3. [Processing Documents](#processing-documents)
4. [Exporting Results](#exporting-results)
5. [Settings Configuration](#settings-configuration)
6. [Offline Usage](#offline-usage)
7. [System Health](#system-health)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### What is PHI De-ID Studio?
PHI De-ID Studio is a HIPAA-compliant web application that automatically identifies and redacts Protected Health Information (PHI) from medical documents. It works entirely in your browser, ensuring your sensitive data never leaves your device.

### System Requirements
- **Browser**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **Device**: Any device with a modern web browser
- **Internet**: Required for initial setup, optional for processing

### First Steps
1. **Open the Application**: Navigate to https://gbphilter.netlify.app
2. **Allow Notifications**: When prompted, allow notifications for offline alerts
3. **Install as App**: Click the install prompt or use browser menu → "Install app"

---

## 📁 Uploading Documents

### Supported File Types
- **Text Files**: .txt, .md, .csv
- **Documents**: .docx, .pdf
- **Images**: .jpg, .png (OCR processing)
- **Size Limit**: 10MB per file

### Upload Methods

#### Method 1: Drag and Drop
1. **Drag Files**: Simply drag files from your computer to the upload area
2. **Multiple Files**: Select multiple files and drag them together
3. **Visual Feedback**: Files appear in the processing queue immediately

#### Method 2: File Browser
1. **Click Upload**: Click the "Upload Files" button
2. **Select Files**: Use your system's file browser to select documents
3. **Confirm Selection**: Click "Open" to add files to queue

#### Method 3: Copy and Paste
1. **Copy Text**: Copy text from any source (emails, documents, etc.)
2. **Paste**: Use Ctrl+V (Windows) or Cmd+V (Mac) in the text area
3. **Process**: Click "Process Text" to de-identify

### Upload Tips
- **Batch Processing**: Upload multiple files at once for efficiency
- **File Naming**: Use descriptive names for easy identification
- **Pre-processing**: Clean up obvious PHI manually for better results

---

## ⚙️ Processing Documents

### Before Processing
1. **Review Settings**: Click the gear icon to configure de-identification rules
2. **Select PHI Types**: Choose which types of PHI to redact
3. **Custom Rules**: Add any custom patterns specific to your data

### Processing Steps

#### Step 1: Configure Settings
1. **Open Settings**: Click the ⚙️ icon in the sidebar
2. **Select PHI Types**: Toggle specific types (names, SSNs, etc.)
3. **Custom Patterns**: Add custom regex patterns if needed
4. **Save Settings**: Click "Save Configuration"

#### Step 2: Start Processing
1. **Review Files**: Check the file list in the processing queue
2. **Click Process**: Press "Process All Files" button
3. **Monitor Progress**: Watch the progress bar and status updates
4. **Review Results**: Check the preview panel for redacted content

#### Step 3: Verify Results
1. **Check Preview**: Review the redacted text in the preview panel
2. **Spot Check**: Verify a few key redactions are correct
3. **Adjust Settings**: Modify rules if needed and re-process

### Processing Options
- **Quick Process**: Fast processing for simple documents
- **Thorough Process**: Comprehensive PHI detection for complex documents
- **Custom Rules**: Use custom patterns for specific needs

---

## 📊 Exporting Results

### Export Formats
- **TXT**: Plain text with redactions marked as [REDACTED]
- **CSV**: Structured data with separate columns for original and redacted text
- **JSON**: Machine-readable format with detailed redaction metadata

### Export Process
1. **Select Files**: Choose which processed files to export
2. **Choose Format**: Select TXT, CSV, or JSON
3. **Include Metadata**: Optionally include processing metadata
4. **Download**: Files download automatically to your Downloads folder

### Export Tips
- **Batch Export**: Export multiple files at once
- **Format Selection**: Choose format based on your downstream needs
- **Metadata**: Include metadata for audit trails
- **Naming**: Exported files maintain original names with "_deidentified" suffix

---

## ⚙️ Settings Configuration

### De-identification Rules
Configure which types of PHI to redact:

#### Personal Identifiers
- **Names**: Patient, doctor, family member names
- **SSNs**: Social Security Numbers
- **Phone Numbers**: All phone number formats
- **Addresses**: Street addresses, cities, states, ZIP codes
- **Email Addresses**: All email formats

#### Medical Identifiers
- **MRNs**: Medical Record Numbers
- **Account Numbers**: Hospital/facility account numbers
- **Device IDs**: Medical device identifiers
- **Health Plan IDs**: Insurance member numbers

#### Financial Identifiers
- **Credit Cards**: All credit card numbers
- **Bank Accounts**: Account and routing numbers
- **Driver's Licenses**: State driver's license numbers

#### Custom Patterns
Add your own regex patterns for specific needs:
- **Hospital IDs**: Custom hospital identifier formats
- **Study Numbers**: Research study identifiers
- **Legacy Systems**: Old system identifiers

### Export Settings
- **Default Format**: Set default export format
- **Include Metadata**: Always include processing information
- **File Naming**: Customize exported file naming conventions

### Offline Settings
- **Storage Limit**: Set maximum local storage (default: 100MB)
- **Auto-sync**: Automatically sync when back online
- **Clear Cache**: Manually clear local storage

---

## 📱 Offline Usage

### How Offline Works
- **Local Storage**: All data stored in browser's IndexedDB
- **No Internet Required**: Process documents without connection
- **Auto-sync**: Uploads processed files when reconnected

### Offline Setup
1. **Install App**: Install as PWA for best offline experience
2. **Test Offline**: Disconnect internet and verify functionality
3. **Monitor Storage**: Check available storage in Settings

### Offline Tips
- **Pre-download**: Download datasets before going offline
- **Storage Management**: Regularly clear old processed files
- **Sync Status**: Check sync status when reconnecting

---

## 🏥 System Health

### Accessing Health Check
1. **Open Sidebar**: Click the hamburger menu (☰)
2. **System Health**: Click "System Health Check" at bottom
3. **Run Diagnostics**: Click "Run Full Health Check"

### Health Check Features
- **Browser Compatibility**: Check if browser supports all features
- **Storage Status**: Monitor available storage space
- **Performance**: Test processing speed and memory usage
- **Hugging Face**: Verify dataset access

### Interpreting Results
- **Green**: All systems working correctly
- **Yellow**: Minor issues, functionality intact
- **Red**: Critical issues, some features may not work

---

## 🔧 Troubleshooting

### Common Issues

#### "No files processed" Error
**Cause**: Unsupported file format or empty file
**Solution**: 
1. Check file format is supported
2. Verify file is not empty
3. Try converting to .txt format

#### "Storage full" Error
**Cause**: Local storage limit reached
**Solution**:
1. Clear old processed files
2. Increase storage limit in Settings
3. Export and delete old files

#### "Processing failed" Error
**Cause**: Complex document or browser memory issue
**Solution**:
1. Try processing smaller chunks
2. Restart browser
3. Check System Health for memory issues

#### "Export failed" Error
**Cause**: Browser security settings
**Solution**:
1. Check browser downloads permissions
2. Try different export format
3. Check available disk space

### Browser-Specific Issues

#### Chrome
- **Issue**: Service worker not registering
- **Solution**: Clear browser cache, restart Chrome

#### Firefox
- **Issue**: File upload not working
- **Solution**: Check Firefox privacy settings

#### Safari
- **Issue**: PWA installation prompt not appearing
- **Solution**: Use "Share" → "Add to Home Screen"

---

## ✅ Best Practices

### Security
- **HTTPS Only**: Always use HTTPS version
- **Private Browsing**: Use private/incognito mode for sensitive data
- **Clear Cache**: Clear browser cache after processing sensitive data
- **Strong Passwords**: Use strong passwords for device access

### Efficiency
- **Batch Processing**: Process multiple files together
- **Pre-processing**: Clean obvious PHI manually
- **Settings Templates**: Save common settings configurations
- **Regular Updates**: Keep app updated for latest features

### Data Management
- **Regular Backups**: Export settings and configurations
- **File Organization**: Use clear naming conventions
- **Storage Cleanup**: Regularly clear old processed files
- **Audit Trails**: Maintain export logs for compliance

### Quality Assurance
- **Spot Checks**: Regularly verify redaction accuracy
- **Test Cases**: Use provided test files to verify functionality
- **Feedback**: Report any issues or inaccuracies
- **Updates**: Stay informed about new features and improvements

---

## 📞 Support

### Getting Help
- **Documentation**: Check this manual and README
- **GitHub Issues**: Report bugs at https://github.com/satishskid/gbPhilter/issues
- **Discussions**: Ask questions in GitHub Discussions
- **Email**: Contact support@gbphilter.com

### Feedback
- **Feature Requests**: Submit via GitHub Issues
- **Bug Reports**: Include browser version and steps to reproduce
- **General Feedback**: Share your experience and suggestions

---

## 🎯 Quick Reference

### Keyboard Shortcuts
- **Ctrl+U / Cmd+U**: Upload files
- **Ctrl+P / Cmd+P**: Process files
- **Ctrl+E / Cmd+E**: Export results
- **Ctrl+, / Cmd+,**: Open settings

### File Size Limits
- **Individual Files**: 10MB maximum
- **Total Storage**: 100MB default (configurable)
- **Batch Upload**: 50 files maximum at once

### Processing Times
- **Small Files** (< 1MB): 1-3 seconds
- **Medium Files** (1-5MB): 5-15 seconds
- **Large Files** (> 5MB): 15-60 seconds

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Compatibility**: All modern browsers