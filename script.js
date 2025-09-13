// Global state management
let llama = null;
let modelLoaded = false;
let fileQueue = [];
let processedFiles = [];
let currentView = 'upload';
let deidEngine = null;
let settings = {
  redactNames: true,
  redactDates: true,
  redactAddresses: true,
  redactPhoneNumbers: true,
  redactSSN: true,
  redactMRN: true,
  redactEmails: true,
  redactURLs: true,
  redactCreditCards: true,
  redactDriversLicense: true,
  customPatterns: []
};

// Model management
async function loadModel() {
  if (modelLoaded) return;

  const wasmPath = './llama.wasm';
  const modelPath = './meditron.Q4_K_M.gguf';

  try {
    window.llama = new window.Llama({ wasmPath });
    await window.llama.loadModel(modelPath);
    modelLoaded = true;
    console.log('✅ Model loaded!');
    updateModelStatus(true);
  } catch (error) {
    console.error('Failed to load model:', error);
    updateModelStatus(false);
    showError('Failed to load AI model. Please ensure meditron.Q4_K_M.gguf is present.');
  }
}

function updateModelStatus(loaded) {
  const statusEl = document.getElementById('modelStatus');
  if (statusEl) {
    statusEl.textContent = loaded ? 'Ready' : 'Loading...';
    statusEl.className = loaded ? 'status ready' : 'status loading';
  }
}

// Enhanced SYSTEM_PROMPT with configurable options
function buildSystemPrompt() {
  let prompt = "You are a medical privacy assistant. Your job is to remove all Protected Health Information (PHI) from clinical documents while preserving medical meaning.\n\nRedact these types of PHI:";
  
  if (settings.redactNames) prompt += "\n- Names (patients, doctors, family)";
  if (settings.redactDates) prompt += "\n- Dates (birth, admission, discharge, procedures)";
  if (settings.redactAddresses) prompt += "\n- Addresses (home, hospital, zip codes)";
  if (settings.redactPhoneNumbers) prompt += "\n- Phone numbers";
  if (settings.redactSSN) prompt += "\n- Social Security Numbers (SSN)";
  if (settings.redactMRN) prompt += "\n- Medical Record Numbers (MRN), Account Numbers";
  if (settings.redactEmails) prompt += "\n- Email addresses";
  
  prompt += "\n- Any other identifiers: \"my cousin John\", \"the nurse at St. Mary's\"";

  if (settings.customPatterns.length > 0) {
    prompt += "\n- Custom patterns: " + settings.customPatterns.join(', ');
  }

  prompt += "\n\nRules:\n1. Return ONLY the redacted text — NO explanations.\n2. For tables: keep structure — replace PHI values with [REDACTED].\n3. For images: fix OCR errors (e.g., \"J0hn\" → \"[REDACTED]\").\n\nExample:\nInput: \"Patient John Doe, age 45, visited on 2024-03-15 at 123 Main St, phone 555-0123.\"\nOutput: \"Patient [REDACTED], age 45, visited on [REDACTED] at [REDACTED], phone [REDACTED].\"\n\nNow process this:\n";

  return prompt;
}

async function runLLM(prompt) {
  if (!modelLoaded) {
    throw new Error('AI model not loaded');
  }

  try {
    const response = await llama.generate({
      prompt: prompt,
      n_predict: 512,
      temperature: 0.1,
      repeat_penalty: 1.1,
      stop: ["\n\n", "Output:"]
    });
    return response.trim();
  } catch (error) {
    throw new Error('AI processing failed: ' + error.message);
  }
}

// File upload and processing
class FileProcessor {
  constructor() {
    this.queue = [];
    this.processed = [];
    this.currentFile = null;
  }

  addFiles(files) {
    const validFiles = Array.from(files).filter(file => this.isValidFileType(file));
    
    validFiles.forEach(file => {
      const fileObj = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
        progress: 0,
        result: null,
        error: null,
        timestamp: new Date()
      };
      
      this.queue.push(fileObj);
      this.renderFileList();
    });

    if (validFiles.length !== files.length) {
      showToast('Some files were skipped due to unsupported formats', 'warning');
    }
  }

  isValidFileType(file) {
    const validTypes = [
      'text/plain',
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    const validExtensions = ['txt', 'csv', 'xlsx', 'xls', 'pdf', 'jpg', 'jpeg', 'png'];
    const extension = file.name.toLowerCase().split('.').pop();
    
    return validTypes.includes(file.type) || validExtensions.includes(extension);
  }

  async processNext() {
    if (this.queue.length === 0 || !modelLoaded) return;

    const fileObj = this.queue.find(f => f.status === 'pending');
    if (!fileObj) return;

    this.currentFile = fileObj;
    fileObj.status = 'processing';
    fileObj.progress = 0;
    
    this.renderFileList();
    showView('process');

    try {
      const text = await this.extractText(fileObj.file, (progress) => {
        fileObj.progress = progress;
        this.updateFileProgress(fileObj.id, progress);
      });

      fileObj.progress = 80;
      this.updateFileProgress(fileObj.id, 80);

      const prompt = buildSystemPrompt() + text;
      const result = await runLLM(prompt);

      fileObj.result = result;
      fileObj.status = 'completed';
      fileObj.progress = 100;
      
      this.processed.push(fileObj);
      this.queue = this.queue.filter(f => f.id !== fileObj.id);
      
      this.renderFileList();
      this.renderResults();
      showView('results');
      
    } catch (error) {
      fileObj.status = 'error';
      fileObj.error = error.message;
      this.renderFileList();
      showError(`Error processing ${fileObj.name}: ${error.message}`);
    }
  }

  async extractText(file, onProgress) {
    const extension = file.name.toLowerCase().split('.').pop();
    
    onProgress(10);

    switch (extension) {
      case 'csv':
      case 'xlsx':
      case 'xls':
        return await this.parseSpreadsheet(file, onProgress);
      case 'pdf':
        return await this.parsePDF(file, onProgress);
      case 'jpg':
      case 'jpeg':
      case 'png':
        return await this.parseImage(file, onProgress);
      default:
        return await this.readFileText(file, onProgress);
    }
  }

  async parseSpreadsheet(file, onProgress) {
    onProgress(20);
    const data = await file.arrayBuffer();
    onProgress(40);
    const workbook = XLSX.read(data, { type: 'array' });
    onProgress(60);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    onProgress(80);
    return XLSX.utils.sheet_to_csv(worksheet);
  }

  async parsePDF(file, onProgress) {
    onProgress(20);
    const pdf = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.mjs');
    onProgress(40);
    const loadingTask = pdf.getDocument(URL.createObjectURL(file));
    const doc = await loadingTask.promise;
    onProgress(60);
    
    let text = '';
    const totalPages = doc.numPages;
    
    for (let i = 1; i <= totalPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n\n';
      onProgress(60 + (i / totalPages) * 20);
    }
    
    return text;
  }

  async parseImage(file, onProgress) {
    onProgress(20);
    const { createWorker } = await import('https://cdn.jsdelivr.net/npm/tesseract.js@2.1.6/dist/tesseract.min.js');
    const worker = createWorker();
    
    onProgress(40);
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    onProgress(60);
    const { data: { text } } = await worker.recognize(file);
    onProgress(80);
    await worker.terminate();
    
    return text;
  }

  async readFileText(file, onProgress) {
    onProgress(40);
    const text = await file.text();
    onProgress(80);
    return text;
  }

  renderFileList() {
    const uploadQueue = document.getElementById('uploadQueue');
    if (!uploadQueue) return;

    uploadQueue.innerHTML = '';
    
    [...this.queue, ...this.processed.slice(-5)].forEach(fileObj => {
      const fileEl = this.createFileElement(fileObj);
      uploadQueue.appendChild(fileEl);
    });
  }

  createFileElement(fileObj) {
    const div = document.createElement('div');
    div.className = `file-item ${fileObj.status}`;
    div.innerHTML = `
      <div class="file-info">
        <span class="file-name">${fileObj.name}</span>
        <span class="file-size">${this.formatFileSize(fileObj.size)}</span>
      </div>
      <div class="file-status">
        ${this.getStatusIcon(fileObj.status)}
        ${fileObj.status === 'processing' ? `<span>${fileObj.progress}%</span>` : ''}
      </div>
    `;
    return div;
  }

  getStatusIcon(status) {
    const icons = {
      pending: '⏳',
      processing: '🔄',
      completed: '✅',
      error: '❌'
    };
    return icons[status] || '❓';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  updateFileProgress(fileId, progress) {
    const fileEl = document.querySelector(`[data-file-id="${fileId}"]`);
    if (fileEl) {
      const progressBar = fileEl.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }
  }

  renderResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';
    
    this.processed.slice().reverse().forEach(fileObj => {
      if (fileObj.status === 'completed') {
        const resultEl = this.createResultElement(fileObj);
        resultsContainer.appendChild(resultEl);
      }
    });
  }

  createResultElement(fileObj) {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <div class="result-header">
        <h4>${fileObj.name}</h4>
        <div class="result-actions">
          <div class="dropdown">
            <button class="btn btn-sm" onclick="toggleDropdown(this)">
              📥 Export
              <span class="dropdown-arrow">▼</span>
            </button>
            <div class="dropdown-content">
              <a href="#" onclick="exportIndividualFile('${fileObj.id}', 'txt'); return false;">📄 Text</a>
              <a href="#" onclick="exportIndividualFile('${fileObj.id}', 'csv'); return false;">📊 CSV</a>
              <a href="#" onclick="exportIndividualFile('${fileObj.id}', 'json'); return false;">📋 JSON</a>
            </div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="fileProcessor.copyResult('${fileObj.id}')">📋 Copy</button>
        </div>
      </div>
      <div class="result-content">
        <div class="result-stats">
          <small>Processed: ${new Date(fileObj.timestamp).toLocaleString()}</small>
          <small>Size: ${(fileObj.file.size / 1024).toFixed(1)} KB</small>
          <small>PHI Items: ${fileObj.detectionResults?.length || 0}</small>
        </div>
        <pre class="result-text">${fileObj.result}</pre>
      </div>
    `;
    return div;
  }

  downloadResult(fileId) {
    const fileObj = this.processed.find(f => f.id === fileId);
    if (fileObj && fileObj.result) {
      const blob = new Blob([fileObj.result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deidentified_${fileObj.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  copyResult(fileId) {
    const fileObj = this.processed.find(f => f.id === fileId);
    if (fileObj && fileObj.result) {
      navigator.clipboard.writeText(fileObj.result).then(() => {
        showToast('Result copied to clipboard!');
      });
    }
  }

  updateProcessingStats() {
    const totalFiles = this.queue.length + this.processed.length;
    const processedCount = this.processed.length;
    const progress = totalFiles > 0 ? (processedCount / totalFiles) * 100 : 0;

    document.getElementById('filesProcessed').textContent = processedCount;
    document.getElementById('totalFiles').textContent = totalFiles;
    document.getElementById('progressText').textContent = `${Math.round(progress)}%`;
    document.getElementById('overallProgress').style.width = `${progress}%`;
  }

  updateProcessingPreview(originalText, redactedText, detectionResults) {
    // Update text previews
    document.getElementById('originalPreview').textContent = originalText.substring(0, 500) + (originalText.length > 500 ? '...' : '');
    document.getElementById('redactedPreview').textContent = redactedText.substring(0, 500) + (redactedText.length > 500 ? '...' : '');

    // Update PHI stats
    document.getElementById('namesCount').textContent = detectionResults.names?.length || 0;
    document.getElementById('datesCount').textContent = detectionResults.dates?.length || 0;
    document.getElementById('addressesCount').textContent = detectionResults.addresses?.length || 0;
    document.getElementById('phonesCount').textContent = detectionResults.phoneNumbers?.length || 0;
    document.getElementById('totalPHI').textContent = detectionResults.total || 0;
  }

  async processFiles() {
    if (this.queue.length === 0) {
      showToast('No files to process');
      return;
    }

    showView('process');
    this.updateProcessingStats();

    for (let i = 0; i < this.queue.length; i++) {
      const fileObj = this.queue[i];
      fileObj.status = 'processing';
      this.renderFileList();

      try {
        const text = await this.extractText(fileObj.file, (progress) => {
          fileObj.progress = progress;
          this.renderFileList();
        });

        // Configure de-identification engine
        deidEngine.configure({
          redactNames: settings.redactNames,
          redactDates: settings.redactDates,
          redactAddresses: settings.redactAddresses,
          redactPhoneNumbers: settings.redactPhoneNumbers,
          redactSSN: settings.redactSSN,
          redactMRN: settings.redactMRN,
          redactEmails: settings.redactEmails,
          redactURLs: settings.redactURLs,
          redactCreditCards: settings.redactCreditCards,
          redactDriversLicense: settings.redactDriversLicense,
          customPatterns: settings.customPatterns
        });

        // Process with de-identification engine
        const detectionResults = deidEngine.detectPHI(text);
        const redactedText = deidEngine.deidentify(text);

        fileObj.result = redactedText;
        fileObj.originalText = text;
        fileObj.detectionResults = detectionResults;
        fileObj.status = 'completed';
        fileObj.progress = 100;

        // Update preview for first file
        if (i === 0) {
          this.updateProcessingPreview(text, redactedText, detectionResults);
        }

      } catch (error) {
        console.error('Error processing file:', error);
        fileObj.status = 'error';
        fileObj.error = error.message;
      }

      this.updateProcessingStats();
    }

    // Move all processed files from queue to processed
    this.processed.push(...this.queue.filter(f => f.status === 'completed'));
    this.queue = [];
    
    this.renderFileList();
    this.renderResults();
    
    setTimeout(() => {
      showView('results');
    }, 2000);
  }
}

// Global file processor instance
const fileProcessor = new FileProcessor();

// UI Management
function showView(viewName) {
  const views = ['upload', 'process', 'results', 'settings'];
  const navItems = document.querySelectorAll('.nav-item');
  
  views.forEach(view => {
    const element = document.getElementById(`${view}View`);
    if (element) {
      element.style.display = view === viewName ? 'block' : 'none';
    }
  });
  
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });
  
  currentView = viewName;
}

// Event handlers
document.addEventListener('DOMContentLoaded', async () => {
  await loadModel();
  deidEngine = new DeidentificationEngine();
  
  // Initialize UI
  showView('upload');
  setupEventListeners();
  loadSettings();
});

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.dataset.view;
      showView(view);
      
      if (view === 'results') {
        fileProcessor.renderResults();
      }
    });
  });

  // File upload
  const fileInput = document.getElementById('fileInput');
  const dropArea = document.getElementById('dropArea');
  const browseBtn = document.getElementById('browseBtn');
  const processBtn = document.getElementById('processBtn');

  if (browseBtn) {
    browseBtn.addEventListener('click', () => fileInput.click());
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      fileProcessor.addFiles(e.target.files);
      e.target.value = '';
    });
  }

  if (processBtn) {
    processBtn.addEventListener('click', () => {
      fileProcessor.processNext();
    });
  }

  // Drag and drop
  if (dropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
    });

    dropArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      fileProcessor.addFiles(files);
    }, false);
  }

  // Settings
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettings();
      showToast('Settings saved!');
    });
  }

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'u':
          e.preventDefault();
          showView('upload');
          break;
        case 'r':
          e.preventDefault();
          showView('results');
          break;
        case ',':
          e.preventDefault();
          showView('settings');
          break;
      }
    }
  });
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Settings management
function loadSettings() {
  const saved = localStorage.getItem('phiDeidSettings');
  if (saved) {
    settings = { ...settings, ...JSON.parse(saved) };
  }
  
  // Update settings form
  const form = document.getElementById('settingsForm');
  if (form) {
    Object.keys(settings).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = settings[key];
        } else if (input.type === 'text') {
          input.value = settings[key].join(', ');
        }
      }
    });
  }
}

function saveSettings() {
  const form = document.getElementById('settingsForm');
  if (form) {
    const formData = new FormData(form);
    
    settings.redactNames = formData.get('redactNames') === 'on';
    settings.redactDates = formData.get('redactDates') === 'on';
    settings.redactAddresses = formData.get('redactAddresses') === 'on';
    settings.redactPhoneNumbers = formData.get('redactPhoneNumbers') === 'on';
    settings.redactSSN = formData.get('redactSSN') === 'on';
    settings.redactMRN = formData.get('redactMRN') === 'on';
    settings.redactEmails = formData.get('redactEmails') === 'on';
    settings.redactURLs = formData.get('redactURLs') === 'on';
    settings.redactCreditCards = formData.get('redactCreditCards') === 'on';
    settings.redactDriversLicense = formData.get('redactDriversLicense') === 'on';
    
    const customPatterns = formData.get('customPatterns');
    settings.customPatterns = customPatterns ? customPatterns.split(',').map(p => p.trim()).filter(p => p) : [];
    
    localStorage.setItem('phiDeidSettings', JSON.stringify(settings));
  }
}

// Toast notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Error handling
function showError(message) {
  showToast(message, 'error');
  console.error(message);
}

// Loading states
function showLoading(message = 'Processing...') {
  const loading = document.getElementById('loadingOverlay');
  if (loading) {
    const messageEl = loading.querySelector('.loading-message');
    if (messageEl) messageEl.textContent = message;
    loading.style.display = 'flex';
  }
}

function hideLoading() {
  const loading = document.getElementById('loadingOverlay');
  if (loading) {
    loading.style.display = 'none';
  }
}

// Enhanced export functionality
function exportAllResults() {
  if (fileProcessor.processed.length === 0) {
    showToast('No processed files to export', 'warning');
    return;
  }

  const format = document.getElementById('outputFormat')?.value || 'txt';
  const includeMetadata = document.getElementById('includeMetadata')?.checked || false;
  
  switch (format) {
    case 'csv':
      exportAsCSV(includeMetadata);
      break;
    case 'json':
      exportAsJSON(includeMetadata);
      break;
    case 'txt':
    default:
      exportAsText(includeMetadata);
      break;
  }
}

function exportAsText(includeMetadata = false) {
  const completed = fileProcessor.processed.filter(f => f.status === 'completed');
  
  const results = completed.map(file => {
    let content = `=== ${file.name} ===\n`;
    if (includeMetadata) {
      content += `Processed: ${new Date().toISOString()}\n`;
      content += `Original size: ${file.file.size} bytes\n`;
      content += `PHI items found: ${file.detectionResults?.length || 0}\n\n`;
    }
    content += `${file.result}\n\n`;
    return content;
  }).join('');

  downloadFile(results, 'all_deidentified_results.txt', 'text/plain');
  showToast('All results exported as text!');
}

function exportAsCSV(includeMetadata = false) {
  const completed = fileProcessor.processed.filter(f => f.status === 'completed');
  
  let csv = 'Filename,Original Text,Redacted Text,PHI Items Found,Processing Date\n';
  
  completed.forEach(file => {
    const originalText = (file.originalText || '').replace(/"/g, '""');
    const redactedText = (file.result || '').replace(/"/g, '""');
    const phiCount = file.detectionResults?.length || 0;
    const processingDate = new Date().toISOString();
    
    csv += `"${file.name}","${originalText}","${redactedText}",${phiCount},"${processingDate}"\n`;
  });

  downloadFile(csv, 'all_deidentified_results.csv', 'text/csv');
  showToast('All results exported as CSV!');
}

function exportAsJSON(includeMetadata = false) {
  const completed = fileProcessor.processed.filter(f => f.status === 'completed');
  
  const data = {
    exportDate: new Date().toISOString(),
    totalFiles: completed.length,
    settings: settings,
    results: completed.map(file => ({
      filename: file.name,
      originalSize: file.file.size,
      processingDate: new Date().toISOString(),
      originalText: includeMetadata ? file.originalText : undefined,
      redactedText: file.result,
      phiItemsFound: file.detectionResults?.length || 0,
      phiDetails: includeMetadata ? file.detectionResults : undefined
    }))
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, 'all_deidentified_results.json', 'application/json');
  showToast('All results exported as JSON!');
}

function exportIndividualFile(file) {
  if (!file || file.status !== 'completed') {
    showToast('File not ready for export', 'warning');
    return;
  }

  const format = document.getElementById('outputFormat')?.value || 'txt';
  const filename = file.name.replace(/\.[^/.]+$/, '') + '_deidentified';

  switch (format) {
    case 'csv':
      const csv = `Original Text,Redacted Text,PHI Items Found\n"${(file.originalText || '').replace(/"/g, '""')}","${(file.result || '').replace(/"/g, '""')}",${file.detectionResults?.length || 0}`;
      downloadFile(csv, `${filename}.csv`, 'text/csv');
      break;
    case 'json':
      const json = JSON.stringify({
        filename: file.name,
        originalText: file.originalText,
        redactedText: file.result,
        phiItemsFound: file.detectionResults?.length || 0,
        phiDetails: file.detectionResults,
        processingDate: new Date().toISOString()
      }, null, 2);
      downloadFile(json, `${filename}.json`, 'application/json');
      break;
    case 'txt':
    default:
      downloadFile(file.result, `${filename}.txt`, 'text/plain');
      break;
  }
  
  showToast(`${file.name} exported successfully!`);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'error');
  });
}

// Clear all results
function clearAllResults() {
  if (fileProcessor.processed.length === 0) return;
  
  if (confirm('Are you sure you want to clear all processed results?')) {
    fileProcessor.processed = [];
    fileProcessor.renderResults();
    showToast('All results cleared');
  }
}

// Dropdown functionality
function toggleDropdown(button) {
  const dropdown = button.nextElementSibling;
  dropdown.classList.toggle('show');
  
  // Close other dropdowns
  document.querySelectorAll('.dropdown-content.show').forEach(content => {
    if (content !== dropdown) content.classList.remove('show');
  });
  
  // Close dropdown when clicking outside
  setTimeout(() => {
    document.addEventListener('click', function closeDropdown(e) {
      if (!button.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeDropdown);
      }
    });
  }, 10);
}

// Keyboard shortcuts help
function showKeyboardShortcuts() {
  const shortcuts = [
    'Ctrl+U: Upload view',
    'Ctrl+R: Results view',
    'Ctrl+,: Settings view',
    'Ctrl+Enter: Start processing',
    'Escape: Close modals'
  ];
  
  alert('Keyboard Shortcuts:\n\n' + shortcuts.join('\n'));
}

// System health check
function checkSystemHealth() {
  const health = {
    timestamp: new Date().toISOString(),
    online: navigator.onLine,
    serviceWorker: 'serviceWorker' in navigator,
    indexedDB: 'indexedDB' in window,
    localStorage: 'localStorage' in window,
    webWorker: typeof Worker !== 'undefined',
    fileAPI: 'FileReader' in window,
    dragDrop: 'draggable' in document.createElement('div'),
    webCrypto: 'crypto' in window && 'subtle' in window.crypto,
    performance: performance.now(),
    memory: navigator.deviceMemory || 'unknown',
    browser: navigator.userAgent,
    platform: navigator.platform
  };
  
  return health;
}

// Hugging Face datasets integration
async function loadHuggingFaceDatasets() {
  const datasets = [
    {
      name: "medical-text-deidentification",
      url: "https://huggingface.co/datasets/medical-text-deidentification",
      description: "Sample medical texts for testing de-identification"
    },
    {
      name: "phi-deidentification-samples", 
      url: "https://huggingface.co/datasets/phi-deidentification-samples",
      description: "PHI de-identification test cases"
    },
    {
      name: "clinical-notes-phi",
      url: "https://huggingface.co/datasets/clinical-notes-phi",
      description: "Clinical notes with PHI for testing"
    }
  ];
  
  return datasets;
}

// Health check UI
function showSystemHealth() {
  const health = checkSystemHealth();
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>System Health Check</h2>
        <button class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="health-grid">
          <div class="health-item ${health.online ? 'healthy' : 'warning'}">
            <strong>Internet:</strong> ${health.online ? 'Online' : 'Offline'}
          </div>
          <div class="health-item ${health.serviceWorker ? 'healthy' : 'error'}">
            <strong>Service Worker:</strong> ${health.serviceWorker ? 'Supported' : 'Not Supported'}
          </div>
          <div class="health-item ${health.indexedDB ? 'healthy' : 'error'}">
            <strong>IndexedDB:</strong> ${health.indexedDB ? 'Available' : 'Not Available'}
          </div>
          <div class="health-item ${health.localStorage ? 'healthy' : 'error'}">
            <strong>Local Storage:</strong> ${health.localStorage ? 'Available' : 'Not Available'}
          </div>
          <div class="health-item ${health.fileAPI ? 'healthy' : 'error'}">
            <strong>File API:</strong> ${health.fileAPI ? 'Supported' : 'Not Supported'}
          </div>
          <div class="health-item">
            <strong>Memory:</strong> ${health.memory} GB
          </div>
        </div>
        
        <h3>Hugging Face Datasets</h3>
        <div class="datasets-list">
          <a href="https://huggingface.co/datasets/medical-text-deidentification" target="_blank" class="dataset-link">
            📊 Medical Text De-identification Dataset
          </a>
          <a href="https://huggingface.co/datasets/phi-deidentification-samples" target="_blank" class="dataset-link">
            🔍 PHI De-identification Samples
          </a>
          <a href="https://huggingface.co/datasets/clinical-notes-phi" target="_blank" class="dataset-link">
            🏥 Clinical Notes PHI Dataset
          </a>
        </div>
        
        <button class="btn btn-primary" onclick="runFullHealthCheck()">Run Full Diagnostic</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function runFullHealthCheck() {
  showToast('Running comprehensive health check...', 'info');
  
  const checks = [
    testIndexedDB(),
    testServiceWorker(),
    testFileProcessing(),
    testExportFunctionality()
  ];
  
  const results = await Promise.allSettled(checks);
  const passed = results.filter(r => r.status === 'fulfilled').length;
  
  showToast(`Health check complete: ${passed}/${checks.length} tests passed`, 
    passed === checks.length ? 'success' : 'warning');
}

async function testIndexedDB() {
  try {
    await offlineStorage.init();
    return true;
  } catch {
    throw new Error('IndexedDB test failed');
  }
}

async function testServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration !== undefined;
  }
  return false;
}

async function testFileProcessing() {
  const testContent = 'Patient John Doe, SSN: 123-45-6789, DOB: 01/15/1980';
  const result = await processDocument(testContent, 'test.txt');
  return result.redactedItems.length > 0;
}

async function testExportFunctionality() {
  const testResult = {
    fileName: 'test.txt',
    processedContent: '[REDACTED]',
    redactedItems: [{ type: 'name', original: 'John Doe', redacted: '[NAME]' }]
  };
  
  try {
    exportAsText([testResult]);
    return true;
  } catch {
    return false;
  }
}

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Handle online/offline status
window.addEventListener('online', () => {
  showToast('Back online!', 'success');
});

window.addEventListener('offline', () => {
  showToast('You\'re offline. Some features may be limited.', 'warning');
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', async () => {
  await loadModel();
  showView('upload');
  setupEventListeners();
  loadSettings();
  
  // Show welcome message for first-time users
  if (!localStorage.getItem('phiDeidWelcomeShown')) {
    setTimeout(() => {
      showToast('Welcome to PHI De-ID Studio! Drag files to start.', 'info');
      localStorage.setItem('phiDeidWelcomeShown', 'true');
    }, 1000);
  }
});