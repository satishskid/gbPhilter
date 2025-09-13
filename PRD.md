# PHI De-ID Studio PWA - Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** PHI De-ID Studio  
**Version:** 1.0.0  
**Type:** Progressive Web Application (PWA)  
**Target Users:** Healthcare professionals, medical staff, researchers  
**Core Purpose:** Offline AI-powered de-identification of Protected Health Information (PHI) from clinical documents

### 1.1 Key Value Propositions
- **Zero Cloud Processing:** All AI processing happens locally on user's device
- **HIPAA Compliant:** No data transmitted to external servers
- **No Account Required:** Immediate use without registration
- **Offline Capable:** Works without internet after initial setup
- **Universal File Support:** Handles CSV, Excel, PDF, and image formats
- **Medical-Grade AI:** Uses specialized medical LLM (Meditron-7B)

## 2. Functional Requirements

### 2.1 Core Features

#### 2.1.1 File Processing Capabilities
- **Supported Formats:**
  - CSV files (patient lists, clinical data)
  - Excel spreadsheets (.xlsx, .xls)
  - PDF documents (clinical notes, reports)
  - Images (JPG, PNG) - scanned forms, intake documents
  - Plain text files

#### 2.1.2 PHI Redaction Engine
- **Redacted Information Types:**
  - Personal names (patients, doctors, family members)
  - Dates (birth, admission, discharge, procedures)
  - Addresses (home, hospital, ZIP codes)
  - Contact information (phone numbers, email addresses)
  - Social Security Numbers (SSN)
  - Medical Record Numbers (MRN)
  - Account numbers and identifiers
  - Indirect identifiers ("my cousin John", "nurse at St. Mary's")

#### 2.1.3 Output Features
- **Display:** Show redacted text in formatted output area
- **Export Options:**
  - Copy to clipboard functionality
  - Save as .txt file download
  - Maintain original document structure for tables

### 2.2 User Interface Requirements

#### 2.2.1 Main Interface Components
- **Header Section:**
  - Hospital logo (192x192 PNG)
  - Product title: "🏥 PHI De-ID Studio"
  - Tagline: "Local AI. Zero Cloud. HIPAA Compliant."

- **File Upload Area:**
  - Drag & drop zone with visual feedback
  - Browse files button
  - Format indicators: CSV, Excel, PDF, JPG, PNG
  - Loading states during processing

- **Results Display:**
  - Redacted output in monospace font
  - Copy and download buttons
  - Scrollable text area (max-height: 300px)

- **Footer:**
  - Powered by notice: "Llama.cpp (WASM) • All data stays on your device • No telemetry"

#### 2.2.2 Visual Design
- **Color Scheme:**
  - Background: #0f172a (dark slate)
  - Primary: #3b82f6 (blue)
  - Text: #e2e8f0 (light gray)
  - Accent: #60a5fa (light blue)
  - Borders: #475569 (gray)

- **Typography:**
  - Font family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
  - Responsive layout (max-width: 900px)
  - Mobile-friendly design

### 2.3 Technical Architecture

#### 2.3.1 Core Technologies
- **Frontend:**
  - HTML5, CSS3, JavaScript (ES6+)
  - Progressive Web App (PWA) manifest
  - Service Worker for offline functionality

- **AI Engine:**
  - Llama.cpp WebAssembly (WASM)
  - Meditron-7B Q4_K_M quantized model (1.2GB)
  - Local inference, zero cloud dependency

- **File Processing Libraries:**
  - PDF.js (pdf.worker.min.js) - PDF text extraction
  - SheetJS (xlsx.full.min.js) - Excel/CSV parsing
  - Tesseract.js (tesseract.min.js) - OCR for images

#### 2.3.2 File Structure
```
PHI_DeID_Studio_PWA/
├── index.html              # Main application
├── manifest.json           # PWA configuration
├── service-worker.js       # Offline functionality
├── style.css              # Styling
├── script.js              # Application logic
├── llama.js               # Llama.cpp wrapper
├── pdf.worker.min.js      # PDF processing
├── xlsx.full.min.js       # Excel/CSV processing
├── tesseract.min.js       # OCR processing
├── meditron.Q4_K_M.gguf   # AI model (1.2GB)
├── README.txt             # User instructions
└── assets/
    ├── logo.png           # 192x192 PNG logo
    └── favicon.ico        # Favicon
```

## 3. Non-Functional Requirements

### 3.1 Performance Requirements
- **Model Loading:** 10-30 seconds on first use (1.2GB model)
- **File Processing:** 5-15 seconds per document (varies by size)
- **Memory Usage:** 8GB+ RAM recommended
- **Browser Compatibility:** Chrome, Edge, Firefox (latest versions)

### 3.2 Security & Compliance
- **HIPAA Compliance:** Zero data transmission ensures PHI stays local
- **Data Privacy:** No telemetry, tracking, or external communication
- **Local Storage:** All files processed in-memory, no persistent storage
- **Browser Security:** Uses secure WebAssembly sandbox

### 3.3 Accessibility
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Reader Support:** Semantic HTML structure
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Error Handling:** Clear error messages for file processing failures

## 4. User Journey & Use Cases

### 4.1 Primary Use Cases
1. **Clinical Note De-identification**
   - Doctor uploads PDF clinical note
   - AI redacts all PHI while preserving medical meaning
   - Copy redacted text to EHR system

2. **Research Data Preparation**
   - Researcher uploads CSV dataset
   - Bulk redaction of patient identifiers
   - Export clean dataset for analysis

3. **Scanned Form Processing**
   - Staff uploads scanned intake forms
   - OCR extracts text, then redacts PHI
   - Creates anonymized patient summaries

### 4.2 User Journey Flow
1. **Setup:** Download and extract ZIP file
2. **First Use:** Open index.html in browser
3. **Model Loading:** Wait 10-30 seconds for AI model
4. **File Upload:** Drag & drop or browse file
5. **Processing:** Automatic PHI detection and redaction
6. **Output:** Review redacted text
7. **Export:** Copy or save redacted content
8. **Repeat:** Process additional files

## 5. Installation & Setup Requirements

### 5.1 Distribution Method
- **Format:** ZIP file (PHI_DeID_Studio_PWA.zip)
- **Contents:** All files listed in section 2.3.2
- **Size:** ~1.2GB (primarily AI model)
- **Installation:** Extract to Desktop or preferred location

### 5.2 System Requirements
- **Operating System:** Windows 10+, macOS 10.14+, Linux
- **Browser:** Chrome 88+, Edge 88+, Firefox 85+
- **Memory:** 8GB RAM minimum, 16GB recommended
- **Storage:** 2GB free space for installation
- **Internet:** Only required for initial download

### 5.3 PWA Installation
- **Method:** Browser prompt or manual installation
- **Icon:** 192x192 PNG logo
- **Display:** Standalone mode (no browser chrome)
- **Offline:** Service worker enables offline functionality

## 6. Error Handling & Edge Cases

### 6.1 File Processing Errors
- **Corrupted Files:** Graceful error messages
- **Unsupported Formats:** Clear format requirements
- **Large Files:** Memory warnings for files >50MB
- **OCR Failures:** Fallback handling for poor quality images

### 6.2 Model Loading Issues
- **Missing Model:** Clear instructions for model download
- **Memory Issues:** Browser memory limit warnings
- **Browser Compatibility:** Feature detection and fallbacks

## 7. Maintenance & Updates

### 7.1 Update Strategy
- **Manual Updates:** New ZIP file distribution
- **Model Updates:** Optional newer model versions
- **Bug Fixes:** Patch releases via new ZIP
- **Compatibility:** Test with latest browser versions

### 7.2 User Support
- **Documentation:** README.txt with setup instructions
- **Troubleshooting:** Common issues and solutions
- **Contact:** IT department contact for support

## 8. Success Metrics

### 8.1 User Adoption
- **Setup Success Rate:** % of users who successfully install
- **Processing Success Rate:** % of files successfully processed
- **User Retention:** Frequency of use after initial setup

### 8.2 Performance Metrics
- **Model Load Time:** Average time to load AI model
- **Processing Speed:** Average time per document type
- **Error Rate:** % of files that fail processing

## 9. Future Enhancements (Post-MVP)

### 9.1 Additional Features
- **Batch Processing:** Multiple files at once
- **Custom Redaction Rules:** User-defined PHI patterns
- **Integration APIs:** Direct EHR integration
- **Additional Formats:** DOCX, RTF, HL7 files

### 9.2 Enhanced AI Capabilities
- **Model Upgrades:** Larger, more accurate models
- **Multi-language Support:** Non-English clinical documents
- **Context Awareness:** Better understanding of medical context

## 10. Compliance & Legal

### 10.1 Regulatory Compliance
- **HIPAA:** Full compliance with privacy rules
- **FDA:** Considerations for medical device classification
- **GDPR:** European privacy regulation compliance
- **Local Regulations:** Adaptable to local healthcare laws

### 10.2 Documentation
- **User Manual:** Comprehensive setup and usage guide
- **Compliance Documentation:** HIPAA compliance statement
- **Privacy Policy:** Clear data handling practices
- **Terms of Use:** End-user license agreement

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Ready for Development  
**Next Steps:** Technical implementation based on this PRD