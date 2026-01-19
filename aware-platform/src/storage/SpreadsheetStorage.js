import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

class SpreadsheetStorage {
  constructor(filePath = './data/submissions.xlsx') {
    this.filePath = filePath;
    this.workbookCache = null;
    this.lastModified = null;
    this.ensureDataDirectory();
  }
  
  ensureDataDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Laad bestaande workbook of maak een nieuwe (met caching)
   */
  loadWorkbook() {
    // Check of bestand gewijzigd is sinds laatste load
    if (fs.existsSync(this.filePath)) {
      const stats = fs.statSync(this.filePath);
      const modified = stats.mtime.getTime();
      
      // Return cached workbook als bestand niet gewijzigd is
      if (this.workbookCache && this.lastModified === modified) {
        return this.workbookCache;
      }
      
      this.workbookCache = XLSX.readFile(this.filePath);
      this.lastModified = modified;
      return this.workbookCache;
    }
    
    // Maak nieuwe workbook met lege sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([]), 'Submissions');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([]), 'Materials');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([]), 'Validation Sources');
    this.workbookCache = wb;
    return wb;
  }
  
  /**
   * Sla workbook op en invalideer cache
   */
  saveWorkbook(wb) {
    XLSX.writeFile(wb, this.filePath);
    this.workbookCache = null;
    this.lastModified = null;
  }
  
  /**
   * Sla een nieuwe submission op
   */
  saveSubmission(formData) {
    const wb = this.loadWorkbook();
    
    // Hoofdsheet: Submissions
    this.addSubmissionRow(wb, formData);
    
    // Materials detail sheet
    this.saveMaterialsDetail(wb, formData);
    
    // Validation sources detail sheet (voor self-validation)
    if (formData.validationMethod === 'SelfValidation' && formData.selfValidation) {
      this.saveValidationSources(wb, formData);
    }
    
    // Schrijf workbook naar bestand
    this.saveWorkbook(wb);
    
    return formData.id;
  }
  
  /**
   * Voeg submission row toe aan Submissions sheet
   */
  addSubmissionRow(wb, formData) {
    const ws = wb.Sheets['Submissions'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    const row = formData.toSpreadsheetRow();
    
    // Als de sheet leeg is, voeg headers toe
    if (data.length === 0) {
      data.push(Object.keys(row));
    }
    
    // Voeg data row toe
    data.push(Object.values(row));
    
    // Update sheet
    wb.Sheets['Submissions'] = XLSX.utils.aoa_to_sheet(data);
  }
  
  /**
   * Sla materiaal details op in aparte sheet
   */
  saveMaterialsDetail(wb, formData) {
    const ws = wb.Sheets['Materials'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    // Headers
    if (data.length === 0) {
      data.push([
        'Submission ID',
        'Submission Date',
        'Production Lot/Batch No.',
        'Composition Material',
        'Percentage',
        'Sustainable',
        'Sustainability Claim',
        'Feedstock Type'
      ]);
    }
    
    // Voeg row toe voor elk materiaal
    formData.materials.forEach(material => {
      data.push([
        formData.id,
        formData.submissionDate,
        formData.productionLotBatchNo,
        material.compositionMaterial,
        material.percentage,
        material.sustainable ? 'Yes' : 'No',
        material.sustainabilityClaim || '',
        material.feedstockRecycledMaterials || ''
      ]);
    });
    
    wb.Sheets['Materials'] = XLSX.utils.aoa_to_sheet(data);
  }
  
  /**
   * Sla validatie bronnen op in aparte sheet
   */
  saveValidationSources(wb, formData) {
    const ws = wb.Sheets['Validation Sources'];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    // Headers
    if (data.length === 0) {
      data.push([
        'Submission ID',
        'Production Lot/Batch No.',
        'Source #',
        'Kgs',
        'Feedstock Type',
        'Feedstock Source Type',
        'Source Name',
        'Address',
        'Source Certification',
        'Source Invoice No.',
        'Source Invoice Date',
        'Invoice File',
        'Packing List File',
        'Proof of Delivery File',
        'Lab Testing File',
        'Certificates',
        'Other Documents'
      ]);
    }
    
    // Voeg row toe voor elke bron
    formData.selfValidation.sources.forEach((source, index) => {
      data.push([
        formData.id,
        formData.productionLotBatchNo,
        index + 1,
        source.kgs,
        source.feedstockType,
        source.feedstockSourceType,
        source.sourceName,
        source.address,
        source.sourceCertification,
        source.sourceInvoiceNo,
        source.sourceInvoiceDate,
        source.invoiceFile,
        source.packingListFile,
        source.proofOfDeliveryFile,
        source.labTestingFile,
        JSON.stringify(source.certificates || []),
        JSON.stringify(source.otherDocuments || [])
      ]);
    });
    
    wb.Sheets['Validation Sources'] = XLSX.utils.aoa_to_sheet(data);
  }
  
  /**
   * Haal alle submissions op
   */
  getAllSubmissions() {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    
    const wb = this.loadWorkbook();
    const ws = wb.Sheets['Submissions'];
    return XLSX.utils.sheet_to_json(ws);
  }
  
  /**
   * Haal een specifieke submission op
   */
  getSubmission(id) {
    const submissions = this.getAllSubmissions();
    return submissions.find(s => s['Submission ID'] === id);
  }
  
  /**
   * Zoek submissions op basis van criteria
   */
  searchSubmissions(criteria) {
    const submissions = this.getAllSubmissions();
    
    return submissions.filter(submission => {
      return Object.keys(criteria).every(key => {
        if (criteria[key] === null || criteria[key] === undefined) return true;
        return submission[key] === criteria[key];
      });
    });
  }
  
  /**
   * Export naar CSV
   */
  exportToCSV(outputPath = './data/export.csv') {
    const wb = this.loadWorkbook();
    const ws = wb.Sheets['Submissions'];
    const csv = XLSX.utils.sheet_to_csv(ws);
    fs.writeFileSync(outputPath, csv);
    return outputPath;
  }
}

export default SpreadsheetStorage;
