/**
 * Aware Material Tracking SDK
 * Client library voor eenvoudige interactie met de Aware API
 */

class AwareSDK {
  constructor(baseURL = 'http://localhost:3000', options = {}) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.options = {
      timeout: 30000,
      ...options
    };
  }
  
  /**
   * Maak een HTTP request naar de API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...this.options,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      throw new Error(`API Request failed: ${error.message}`);
    }
  }
  
  /**
   * Maak een nieuwe submission aan
   */
  async createSubmission(submissionData) {
    return this.request('/api/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData)
    });
  }
  
  /**
   * Haal alle submissions op
   */
  async getAllSubmissions() {
    return this.request('/api/submissions', {
      method: 'GET'
    });
  }
  
  /**
   * Haal een specifieke submission op via ID
   */
  async getSubmission(id) {
    return this.request(`/api/submissions/${id}`, {
      method: 'GET'
    });
  }
  
  /**
   * Zoek submissions op basis van criteria
   */
  async searchSubmissions(criteria) {
    return this.request('/api/submissions/search', {
      method: 'POST',
      body: JSON.stringify(criteria)
    });
  }
  
  /**
   * Download CSV export
   */
  getCSVExportURL() {
    return `${this.baseURL}/api/export/csv`;
  }
  
  /**
   * Download Excel export
   */
  getExcelExportURL() {
    return `${this.baseURL}/api/export/xlsx`;
  }
}

/**
 * Helper class voor het bouwen van submission data
 */
class SubmissionBuilder {
  constructor() {
    this.data = {
      materials: [],
      certificates: {
        environmental: [],
        social: [],
        chemical: []
      }
    };
  }
  
  // Basis informatie
  setDate(date) {
    this.data.date = date;
    return this;
  }
  
  setProductionFacility(facility) {
    this.data.productionFacility = facility;
    return this;
  }
  
  setValueChainProcess(main, sub) {
    this.data.valueChainProcessMain = main;
    this.data.valueChainProcessSub = sub;
    return this;
  }
  
  setAwareTokenType(type) {
    this.data.awareTokenType = type;
    return this;
  }
  
  setMaterialSpecification(spec) {
    this.data.materialSpecification = spec;
    return this;
  }
  
  // Kleur
  setMainColor(colorCode, colorText) {
    this.data.mainColorSelected = colorCode;
    this.data.mainColorText = colorText;
    return this;
  }
  
  // Batch en gewicht
  setProductionLotBatchNo(batchNo) {
    this.data.productionLotBatchNo = batchNo;
    return this;
  }
  
  setTotalWeight(weightKgs) {
    this.data.totalWeightKgs = weightKgs;
    return this;
  }
  
  // Duurzaamheid
  setSustainableProcessClaims(value) {
    this.data.sustainableProcessClaims = value;
    return this;
  }
  
  setWetProcessing(value) {
    this.data.wetProcessing = value;
    return this;
  }
  
  // Materialen
  addMaterial(material) {
    this.data.materials.push(material);
    return this;
  }
  
  // Aware Asset
  setAwareAssetId(assetId) {
    this.data.awareAssetId = assetId;
    return this;
  }
  
  // Tracer
  setTracerAdded(value) {
    this.data.tracerAdded = value;
    return this;
  }
  
  setAwareTracer(scanDate, testReport) {
    this.data.typeOfTracer = 'Aware';
    this.data.awareTracerPositiveScanDate = scanDate;
    this.data.awareTracerTestReport = testReport;
    this.data.awareTracerConfirmation = true;
    return this;
  }
  
  setCustomTracer(name, date, testReport) {
    this.data.typeOfTracer = 'Custom';
    this.data.customTracerName = name;
    this.data.customTracerDatePositiveReport = date;
    this.data.customTracerTestReport = testReport;
    this.data.customTracerConfirmation = true;
    return this;
  }
  
  // Validatie
  setValidationMethod(method) {
    this.data.validationMethod = method;
    return this;
  }
  
  setSelfValidation(validationData) {
    this.data.validationMethod = 'SelfValidation';
    this.data.selfValidation = validationData;
    return this;
  }
  
  setGuanXuValidation(fullName, documentation) {
    this.data.validationMethod = 'GuanXu';
    this.data.guanXuFullName = fullName;
    this.data.guanXuDocumentation = documentation;
    this.data.guanXuDeclaration = true;
    return this;
  }
  
  setSTCPValidation(fullName, documentation) {
    this.data.validationMethod = 'STCP';
    this.data.stcpFullName = fullName;
    this.data.stcpDocumentation = documentation;
    this.data.stcpDeclaration = true;
    return this;
  }
  
  // Certificaten
  addEnvironmentalCertificate(cert) {
    this.data.certificates.environmental.push(cert);
    return this;
  }
  
  addSocialCertificate(cert) {
    this.data.certificates.social.push(cert);
    return this;
  }
  
  addChemicalCertificate(cert) {
    this.data.certificates.chemical.push(cert);
    return this;
  }
  
  // Build
  build() {
    return this.data;
  }
}

// Export voor Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AwareSDK, SubmissionBuilder };
}

// Export voor browser
if (typeof window !== 'undefined') {
  window.AwareSDK = AwareSDK;
  window.SubmissionBuilder = SubmissionBuilder;
}
