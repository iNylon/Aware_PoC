/**
 * Voorbeeld: Complete self-validation met meerdere bronnen
 */

const { AwareSDK, SubmissionBuilder } = require('../sdk/aware-sdk.js');

async function selfValidationExample() {
  const sdk = new AwareSDK('http://localhost:3000');
  
  const submission = new SubmissionBuilder()
    .setDate('16/01/2026')
    .setProductionFacility('Tiancheng Factory')
    .setValueChainProcess('Spinning', 'Ring Spinning')
    .setAwareTokenType('Yarn')
    .setMaterialSpecification('16/1s')
    .setMainColor('#87CEEB', 'Light Blue')
    .setProductionLotBatchNo('77839H8873')
    .setTotalWeight(8500)
    .addMaterial({
      compositionMaterial: 'Cotton',
      percentage: 100,
      sustainable: true,
      sustainabilityClaim: 'Recycled',
      feedstockRecycledMaterials: 'PostConsumer'
    })
    .setAwareAssetId('tiancheng - Yarn - 13213 - 100% Recycled Cotton(Post-Consumer) - Light Blue - 6564654523')
    .setTracerAdded(true)
    .setCustomTracer('Go Green', '16/01/2026', 'uploads/custom-tracer-report.pdf')
    // Self-validation met meerdere bronnen
    .setSelfValidation({
      sources: [
        {
          kgs: 2000,
          feedstockType: 'Cotton Waste',
          feedstockSourceType: 'Textile Recycler',
          sourceName: 'GreenRecycle Ltd.',
          address: '123 Recycling Street, Shanghai, China',
          sourceCertification: 'GRS',
          sourceInvoiceNo: '77829H23',
          sourceInvoiceDate: '10/01/2026',
          invoiceFile: 'uploads/invoices/77829H23.pdf',
          packingListFile: 'uploads/packing-lists/77829H23.pdf',
          proofOfDeliveryFile: 'uploads/pod/77829H23.pdf',
          labTestingFile: 'uploads/lab-tests/77829H23.pdf',
          certificates: [
            {
              name: 'GRS Certificate',
              file: 'uploads/certificates/grs-cert-001.pdf'
            },
            {
              name: 'ISO 9001',
              file: 'uploads/certificates/iso-9001.pdf'
            }
          ],
          otherDocuments: [
            {
              name: 'Material Safety Data Sheet',
              file: 'uploads/other/msds-001.pdf'
            }
          ]
        },
        {
          kgs: 1500,
          feedstockType: 'Cotton Scraps',
          feedstockSourceType: 'Garment Factory',
          sourceName: 'EcoTextile Factory',
          address: '456 Industrial Zone, Guangzhou, China',
          sourceCertification: 'OCS',
          sourceInvoiceNo: '88940K12',
          sourceInvoiceDate: '12/01/2026',
          invoiceFile: 'uploads/invoices/88940K12.pdf',
          packingListFile: 'uploads/packing-lists/88940K12.pdf',
          proofOfDeliveryFile: 'uploads/pod/88940K12.pdf',
          certificates: [
            {
              name: 'OCS Certificate',
              file: 'uploads/certificates/ocs-cert-002.pdf'
            }
          ]
        }
      ],
      totalSourceInput: 3500  // Som van alle bronnen (moet >= totalWeightKgs zijn voor overrun/waste)
    })
    .addEnvironmentalCertificate({
      name: 'GRS',
      description: 'Global Recycled Standard',
      status: 'VERIFIED',
      validThruDate: '31/08/2026'
    })
    .addSocialCertificate({
      name: 'FairWear',
      description: 'Fair Labor Practices',
      status: 'VERIFIED',
      validThruDate: '01/06/2027'
    })
    .build();
  
  try {
    const result = await sdk.createSubmission(submission);
    console.log('✅ Submission met self-validation aangemaakt!');
    console.log('📋 Submission ID:', result.submissionId);
    console.log('📦 Aantal bronnen:', submission.selfValidation.sources.length);
    console.log('⚖️  Totaal input:', submission.selfValidation.totalSourceInput, 'kg');
    console.log('🏭 Totaal output:', submission.totalWeightKgs, 'kg');
    console.log('📜 Certificaten:', submission.certificates.environmental.length + submission.certificates.social.length);
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run voorbeeld
if (require.main === module) {
  selfValidationExample()
    .then(() => console.log('\n✨ Klaar!'))
    .catch(err => console.error('\n💥 Mislukt:', err));
}

module.exports = selfValidationExample;
