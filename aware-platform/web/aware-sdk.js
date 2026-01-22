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
    this.credentials = null; // Store login credentials
  }
  
  /**
   * Login to the Aware platform
   */
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store credentials for API calls
      this.credentials = { username, password };
      
      return data;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
  
  /**
   * Logout from the Aware platform
   */
  async logout() {
    try {
      await fetch(`${this.baseURL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      this.credentials = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  /**
   * Check if user is logged in
   */
  async checkSession() {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/session`, {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      throw new Error(`Session check failed: ${error.message}`);
    }
  }
  
  /**
   * Submit a batch to the blockchain (requires authentication)
   */
  async submitBatch(batchData) {
    const requestData = {
      ...batchData
    };
    
    // Add credentials if available
    if (this.credentials) {
      requestData.username = this.credentials.username;
      requestData.password = this.credentials.password;
    }
    
    return this.request('/api/batch/submit', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(requestData)
    });
  }
  
  /**
   * Get all batches from blockchain
   */
  async getAllBatches() {
    return this.request('/api/batches', {
      method: 'GET',
      credentials: 'include'
    });
  }
  
  /**
   * Get a specific batch by ID
   */
  async getBatch(id) {
    return this.request(`/batch/${id}`, {
      method: 'GET',
      credentials: 'include'
    });
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

/**
 * Helper class voor het bouwen van batch data voor blockchain
 */
class BatchBuilder {
  constructor() {
    this.physicalAsset = {
      assetId: '',
      material: '',
      composition: '',
      weight: '0',
      batchNumber: '',
      productionDate: '',
      expiryDate: '',
      color: '',
      colorHex: '',
      productionFacility: '',
      valueChainMain: '',
      valueChainSub: '',
      tokenType: '',
      materialSpec: '',
      mainColor: '',
      sustainableClaims: '',
      wetProcessing: ''
    };
    
    this.tracer = {
      supplier: '',
      farmLocation: '',
      country: '',
      gpsCoordinates: '',
      certifications: '',
      harvestDate: '',
      tracerType: '',
      tracerName: '',
      tracerDate: '',
      tracerAdded: 'false'
    };
    
    this.validation = {
      qualityGrade: '',
      moistureContent: '',
      contamination: '',
      inspectionDate: '',
      inspector: 'Self-Validation',
      labResults: '',
      validationType: ''
    };
    
    this.compliance = {
      regulatoryStandards: '',
      sustainabilityCert: '',
      fairTradeCert: '',
      organicCert: '',
      carbonFootprint: '',
      waterUsage: '',
      selectedCerts: ''
    };
  }
  
  // Physical Asset methods
  setAssetId(assetId) {
    this.physicalAsset.assetId = assetId;
    return this;
  }
  
  setBatchNumber(batchNumber) {
    this.physicalAsset.batchNumber = batchNumber;
    return this;
  }
  
  setProductionDate(date) {
    this.physicalAsset.productionDate = date;
    return this;
  }
  
  setMaterial(material) {
    this.physicalAsset.material = material;
    return this;
  }
  
  setWeight(weight) {
    this.physicalAsset.weight = weight.toString();
    return this;
  }
  
  setComposition(composition) {
    this.physicalAsset.composition = composition;
    return this;
  }
  
  setColor(colorHex, colorName) {
    this.physicalAsset.color = colorHex;
    this.physicalAsset.colorHex = colorHex;
    this.physicalAsset.mainColor = colorName;
    return this;
  }
  
  setProductionFacility(facility) {
    this.physicalAsset.productionFacility = facility;
    return this;
  }
  
  setValueChain(main, sub = '') {
    this.physicalAsset.valueChainMain = main;
    this.physicalAsset.valueChainSub = sub;
    return this;
  }
  
  setSustainableClaims(claims) {
    this.physicalAsset.sustainableClaims = claims;
    return this;
  }
  
  setExpiryDate(date) {
    this.physicalAsset.expiryDate = date;
    return this;
  }
  
  setTokenType(type) {
    this.physicalAsset.tokenType = type;
    return this;
  }
  
  setMaterialSpec(spec) {
    this.physicalAsset.materialSpec = spec;
    return this;
  }
  
  setWetProcessing(value) {
    this.physicalAsset.wetProcessing = value;
    return this;
  }
  
  // Tracer methods
  setTracerAdded(added) {
    this.tracer.tracerAdded = added ? 'true' : 'false';
    return this;
  }
  
  setTracerType(type) {
    this.tracer.tracerType = type;
    return this;
  }
  
  setHarvestDate(date) {
    this.tracer.harvestDate = date;
    return this;
  }
  
  setSupplier(supplier) {
    this.tracer.supplier = supplier;
    return this;
  }
  
  setCountry(country) {
    this.tracer.country = country;
    return this;
  }
  
  setFarmLocation(location) {
    this.tracer.farmLocation = location;
    return this;
  }
  
  setGpsCoordinates(coords) {
    this.tracer.gpsCoordinates = coords;
    return this;
  }
  
  setTracerCertifications(certs) {
    this.tracer.certifications = certs;
    return this;
  }
  
  setTracerName(name) {
    this.tracer.tracerName = name;
    return this;
  }
  
  setTracerDate(date) {
    this.tracer.tracerDate = date;
    return this;
  }
  
  // Validation methods
  setInspector(inspector) {
    this.validation.inspector = inspector;
    return this;
  }
  
  setInspectionDate(date) {
    this.validation.inspectionDate = date;
    return this;
  }
  
  setQualityGrade(grade) {
    this.validation.qualityGrade = grade;
    return this;
  }
  
  setMoistureContent(content) {
    this.validation.moistureContent = content;
    return this;
  }
  
  setContamination(contamination) {
    this.validation.contamination = contamination;
    return this;
  }
  
  setLabResults(results) {
    this.validation.labResults = results;
    return this;
  }
  
  setValidationType(type) {
    this.validation.validationType = type;
    return this;
  }
  
  // Compliance methods
  setSustainabilityCert(cert) {
    this.compliance.sustainabilityCert = cert;
    return this;
  }
  
  setFairTradeCert(cert) {
    this.compliance.fairTradeCert = cert;
    return this;
  }
  
  setOrganicCert(cert) {
    this.compliance.organicCert = cert;
    return this;
  }
  
  setRegulatoryStandards(standards) {
    this.compliance.regulatoryStandards = standards;
    return this;
  }
  
  setCarbonFootprint(footprint) {
    this.compliance.carbonFootprint = footprint;
    return this;
  }
  
  setWaterUsage(usage) {
    this.compliance.waterUsage = usage;
    return this;
  }
  
  setSelectedCerts(certs) {
    this.compliance.selectedCerts = certs;
    return this;
  }
  
  // Build
  build() {
    return {
      physicalAsset: this.physicalAsset,
      tracer: this.tracer,
      validation: this.validation,
      compliance: this.compliance
    };
  }
}

// Export voor Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AwareSDK, SubmissionBuilder, BatchBuilder };
}

// Export voor browser
if (typeof window !== 'undefined') {
  window.AwareSDK = AwareSDK;
  window.SubmissionBuilder = SubmissionBuilder;
  window.BatchBuilder = BatchBuilder;
}
