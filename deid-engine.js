// Advanced PHI De-identification Engine
class DeidentificationEngine {
  constructor() {
    this.patterns = {
      // Names - Simple pattern for names
      names: {
        pattern: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g,
        replacement: '[NAME]'
      },

      // Dates - Common date formats
      dates: {
        pattern: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}\b/g,
        replacement: '[DATE]'
      },

      // Addresses - Simple patterns
      addresses: {
        street: {
          pattern: /\b\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr)\b/gi,
          replacement: '[ADDRESS]'
        },
        cityState: {
          pattern: /\b[A-Z][a-z]+\s*,\s*[A-Z]{2}\b/g,
          replacement: '[CITY/STATE]'
        },
        zipCode: {
          pattern: /\b\d{5}(?:-\d{4})?\b/g,
          replacement: '[ZIP]'
        }
      },

      // Phone numbers - Simple format
      phoneNumbers: {
        pattern: /\b\d{3}-\d{3}-\d{4}\b/g,
        replacement: '[PHONE]'
      },

      // Email addresses
      emails: {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi,
        replacement: '[EMAIL]'
      },

      // Social Security Numbers
      ssn: {
        pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
        replacement: '[SSN]'
      },

      // Medical Record Numbers
      mrn: {
        pattern: /\bMRN:?\s*\d+\b/gi,
        replacement: '[MRN]'
      },

      // URLs
      urls: {
        pattern: /\bhttps?:\/\/[^\s]+\b/gi,
        replacement: '[URL]'
      },

      // Credit card numbers
      creditCards: {
        pattern: /\b\d{4}-\d{4}-\d{4}-\d{4}\b/g,
        replacement: '[CARD]'
      },

      // Driver's license numbers
      driversLicense: {
        pattern: /\bDL:?\s*[A-Z0-9]+\b/gi,
        replacement: '[DL]'
      }
    };

    this.contextualRules = [
      // Family relationships with names
      {
        pattern: /\b(?:my|his|her|the)\s+(?:mother|father|sister|brother|wife|husband|son|daughter|aunt|uncle|cousin|nephew|niece|grandmother|grandfather)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
        replacement: '$1 [RELATIVE_NAME]'
      },
      
      // Medical facilities with names
      {
        pattern: /\b(?:Dr\.?|Doctor|Nurse)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Hospital|Medical\s+Center|Clinic|Practice))?)\b/gi,
        replacement: '[DOCTOR] at [FACILITY]'
      },

      // Age with names
      {
        pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+(?:age\s+)?\d{1,3}\b/gi,
        replacement: '[NAME], age [AGE]'
      }
    ];

    this.customPatterns = [];
  }

  // Add custom regex patterns
  addCustomPattern(name, pattern, replacement) {
    this.customPatterns.push({ name, pattern, replacement });
  }

  // Main de-identification method
  deidentify(text, options = {}) {
    const config = {
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
      preserveStructure: true,
      customPatterns: [],
      ...options
    };

    let result = text;

    // Apply standard patterns
    if (config.redactNames) {
      result = result.replace(this.patterns.names.pattern, this.patterns.names.replacement);
    }

    if (config.redactDates) {
      result = result.replace(this.patterns.dates.pattern, this.patterns.dates.replacement);
    }

    if (config.redactAddresses) {
      result = result.replace(this.patterns.addresses.street.pattern, this.patterns.addresses.street.replacement);
      result = result.replace(this.patterns.addresses.cityState.pattern, this.patterns.addresses.cityState.replacement);
      result = result.replace(this.patterns.addresses.zipCode.pattern, this.patterns.addresses.zipCode.replacement);
    }

    if (config.redactPhoneNumbers) {
      result = result.replace(this.patterns.phoneNumbers.pattern, this.patterns.phoneNumbers.replacement);
    }

    if (config.redactEmails) {
      result = result.replace(this.patterns.emails.pattern, this.patterns.emails.replacement);
    }

    if (config.redactSSN) {
      result = result.replace(this.patterns.ssn.pattern, this.patterns.ssn.replacement);
    }

    if (config.redactMRN) {
      result = result.replace(this.patterns.mrn.pattern, this.patterns.mrn.replacement);
    }

    if (config.redactURLs) {
      result = result.replace(this.patterns.urls.pattern, this.patterns.urls.replacement);
    }

    if (config.redactCreditCards) {
      result = result.replace(this.patterns.creditCards.pattern, this.patterns.creditCards.replacement);
    }

    if (config.redactDriversLicense) {
      result = result.replace(this.patterns.driversLicense.pattern, this.patterns.driversLicense.replacement);
    }

    // Apply contextual rules
    this.contextualRules.forEach(rule => {
      result = result.replace(rule.pattern, rule.replacement);
    });

    // Apply custom patterns
    config.customPatterns.forEach(pattern => {
      if (pattern.enabled && pattern.regex) {
        try {
          const regex = new RegExp(pattern.regex, 'gi');
          result = result.replace(regex, pattern.replacement || '[REDACTED]');
        } catch (e) {
          console.warn(`Invalid custom pattern: ${pattern.name}`, e);
        }
      }
    });

    return result;
  }

  // Detect PHI types in text
  detectPHI(text) {
    const detections = [];
    
    Object.entries(this.patterns).forEach(([category, patterns]) => {
      if (typeof patterns === 'object' && patterns.pattern) {
        const matches = text.match(patterns.pattern);
        if (matches) {
          matches.forEach(match => {
            detections.push({
              type: category,
              value: match,
              position: text.indexOf(match)
            });
          });
        }
      } else if (typeof patterns === 'object') {
        Object.entries(patterns).forEach(([subCategory, subPattern]) => {
          if (subPattern.pattern) {
            const matches = text.match(subPattern.pattern);
            if (matches) {
              matches.forEach(match => {
                detections.push({
                  type: `${category}.${subCategory}`,
                  value: match,
                  position: text.indexOf(match)
                });
              });
            }
          }
        });
      }
    });

    return detections.sort((a, b) => a.position - b.position);
  }

  // Get statistics about PHI detection
  getPHIStats(text) {
    const detections = this.detectPHI(text);
    const stats = {
      total: detections.length,
      byType: {},
      uniqueValues: new Set()
    };

    detections.forEach(detection => {
      stats.byType[detection.type] = (stats.byType[detection.type] || 0) + 1;
      stats.uniqueValues.add(detection.value);
    });

    stats.uniqueCount = stats.uniqueValues.size;
    return stats;
  }

  // Validate redaction quality
  validateRedaction(original, redacted) {
    const originalPHI = this.detectPHI(original);
    const redactedPHI = this.detectPHI(redacted);
    
    return {
      originalCount: originalPHI.length,
      remainingCount: redactedPHI.length,
      successRate: ((originalPHI.length - redactedPHI.length) / originalPHI.length) * 100,
      missed: redactedPHI
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeidentificationEngine;
} else {
  window.DeidentificationEngine = DeidentificationEngine;
}