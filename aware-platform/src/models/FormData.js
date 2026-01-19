/**
 * Data model voor het Aware Material Tracking formulier
 * Gebaseerd op de GUI screenshots
 */

class FormData {
  constructor(data = {}) {
    // Basis informatie
    this.id = data.id || null;
    this.submissionDate = data.submissionDate || new Date().toISOString();
    
    // Sectie 1: Algemene productie informatie
    this.date = data.date || null;
    this.productionFacility = data.productionFacility || null;
    this.valueChainProcessMain = data.valueChainProcessMain || null;
    this.valueChainProcessSub = data.valueChainProcessSub || null;
    this.awareTokenType = data.awareTokenType || null;
    this.materialSpecification = data.materialSpecification || null;
    
    // Sectie 2: Kleur informatie
    this.mainColorSelected = data.mainColorSelected || null; // Color value/code
    this.mainColorText = data.mainColorText || null;
    
    // Sectie 3: Batch en gewicht
    this.productionLotBatchNo = data.productionLotBatchNo || null;
    this.totalWeightKgs = data.totalWeightKgs || null;
    
    // Sectie 4: Duurzaamheid claims
    this.sustainableProcessClaims = data.sustainableProcessClaims || false;
    this.wetProcessing = data.wetProcessing || false;
    
    // Sectie 5: Materiaal compositie (array van materialen)
    this.materials = data.materials || [];
    /* Elk materiaal heeft:
    {
      compositionMaterial: string,
      percentage: number,
      sustainable: boolean,
      sustainabilityClaim: 'Recycled'|'Regenerative'|'Organic'|'Transitional'|'Better'|'RegenerativeOrganicCertified',
      feedstockRecycledMaterials: 'PostIndustrial'|'PostConsumer'|null
    }
    */
    
    // Sectie 6: Aware Asset informatie
    this.awareAssetId = data.awareAssetId || null;
    
    // Sectie 7: Tracer informatie
    this.tracerAdded = data.tracerAdded || false;
    this.typeOfTracer = data.typeOfTracer || null; // 'Aware' | 'Custom'
    
    // Aware tracer specifieke velden
    this.awareTracerPositiveScanDate = data.awareTracerPositiveScanDate || null;
    this.awareTracerTestReport = data.awareTracerTestReport || null; // File path/URL
    this.awareTracerConfirmation = data.awareTracerConfirmation || false;
    
    // Custom tracer specifieke velden
    this.customTracerName = data.customTracerName || null;
    this.customTracerDatePositiveReport = data.customTracerDatePositiveReport || null;
    this.customTracerTestReport = data.customTracerTestReport || null; // File path/URL
    this.customTracerConfirmation = data.customTracerConfirmation || false;
    
    // Sectie 8: Validatie methode
    this.validationMethod = data.validationMethod || null; // 'SelfValidation' | 'GuanXu' | 'STCP'
    
    // Self Validation specifieke velden
    this.selfValidation = data.selfValidation || null;
    /* {
      sources: [{
        kgs: number,
        feedstockType: string,
        feedstockSourceType: string,
        sourceName: string,
        address: string,
        sourceCertification: string,
        sourceInvoiceNo: string,
        sourceInvoiceDate: string,
        invoiceFile: string,
        packingListFile: string,
        proofOfDeliveryFile: string,
        labTestingFile: string,
        certificates: [{
          name: string,
          file: string
        }],
        otherDocuments: [{
          name: string,
          file: string
        }]
      }],
      totalSourceInput: number
    }
    */
    
    // Guan Xu validatie
    this.guanXuDocumentation = data.guanXuDocumentation || null; // File path/URL
    this.guanXuFullName = data.guanXuFullName || null;
    this.guanXuDeclaration = data.guanXuDeclaration || false;
    
    // STCP validatie
    this.stcpDocumentation = data.stcpDocumentation || null; // File path/URL
    this.stcpFullName = data.stcpFullName || null;
    this.stcpDeclaration = data.stcpDeclaration || false;
    
    // Sectie 9: Certificaten
    this.certificates = data.certificates || {
      environmental: [],
      social: [],
      chemical: []
    };
    /* Elk certificaat heeft:
    {
      name: string,
      description: string,
      status: 'VERIFIED' | 'PENDING' | 'EXPIRED',
      validThruDate: string
    }
    */
  }
  
  /**
   * Valideer of alle verplichte velden zijn ingevuld
   */
  validate() {
    const errors = [];
    
    if (!this.date) errors.push('Date is required');
    if (!this.productionFacility) errors.push('Production Facility is required');
    if (!this.valueChainProcessMain) errors.push('Value Chain Process (Main) is required');
    if (!this.valueChainProcessSub) errors.push('Value Chain Process (Sub) is required');
    if (!this.materialSpecification) errors.push('Material Specification is required');
    if (!this.mainColorSelected) errors.push('Main Color is required');
    if (!this.productionLotBatchNo) errors.push('Production Lot/Batch No. is required');
    if (!this.totalWeightKgs) errors.push('Total Weight is required');
    
    if (this.materials.length === 0) {
      errors.push('At least one material composition is required');
    }
    
    if (this.tracerAdded && !this.typeOfTracer) {
      errors.push('Type of Tracer is required when tracer is added');
    }
    
    if (!this.validationMethod) {
      errors.push('Validation method is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Converteer naar platte structuur voor spreadsheet
   */
  toSpreadsheetRow() {
    return {
      'Submission ID': this.id,
      'Submission Date': this.submissionDate,
      'Date': this.date,
      'Production Facility': this.productionFacility,
      'Value Chain Process (Main)': this.valueChainProcessMain,
      'Value Chain Process (Sub)': this.valueChainProcessSub,
      'Aware Token Type': this.awareTokenType,
      'Material Specification': this.materialSpecification,
      'Main Color (Selected)': this.mainColorSelected,
      'Main Color (Text)': this.mainColorText,
      'Production Lot/Batch No.': this.productionLotBatchNo,
      'Total Weight (Kgs)': this.totalWeightKgs,
      'Sustainable Process Claims': this.sustainableProcessClaims ? 'Yes' : 'No',
      'Wet Processing': this.wetProcessing ? 'Yes' : 'No',
      'Materials': JSON.stringify(this.materials),
      'Aware Asset ID': this.awareAssetId,
      'Tracer Added': this.tracerAdded ? 'Yes' : 'No',
      'Type of Tracer': this.typeOfTracer,
      'Aware Tracer Scan Date': this.awareTracerPositiveScanDate,
      'Aware Tracer Test Report': this.awareTracerTestReport,
      'Custom Tracer Name': this.customTracerName,
      'Custom Tracer Date': this.customTracerDatePositiveReport,
      'Custom Tracer Report': this.customTracerTestReport,
      'Validation Method': this.validationMethod,
      'Self Validation Data': JSON.stringify(this.selfValidation),
      'Guan Xu Full Name': this.guanXuFullName,
      'STCP Full Name': this.stcpFullName,
      'Certificates': JSON.stringify(this.certificates)
    };
  }
}

export default FormData;
