/**
 * Voorbeeld: Submission met Aware tracer
 */

const { AwareSDK, SubmissionBuilder } = require('../sdk/aware-sdk.js');

async function tracerExample() {
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
    // Aware tracer toevoegen
    .setTracerAdded(true)
    .setAwareTracer(
      '15/11/2022',  // Scan datum
      'uploads/tracer-reports/report-123.pdf'  // Test report
    )
    .setValidationMethod('GuanXu')
    .build();
  
  try {
    const result = await sdk.createSubmission(submission);
    console.log('✅ Submission met Aware tracer aangemaakt!');
    console.log('📋 Submission ID:', result.submissionId);
    console.log('🔬 Tracer scan datum:', '15/11/2022');
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run voorbeeld
if (require.main === module) {
  tracerExample()
    .then(() => console.log('\n✨ Klaar!'))
    .catch(err => console.error('\n💥 Mislukt:', err));
}

module.exports = tracerExample;
