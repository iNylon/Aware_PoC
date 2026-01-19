/**
 * Basis voorbeeld: Eenvoudige submission aanmaken
 */

const { AwareSDK, SubmissionBuilder } = require('../sdk/aware-sdk.js');

async function basicExample() {
  // Initialiseer SDK
  const sdk = new AwareSDK('http://localhost:3000');
  
  // Maak submission met builder
  const submission = new SubmissionBuilder()
    .setDate('16/01/2026')
    .setProductionFacility('Tiancheng Factory')
    .setValueChainProcess('Spinning', 'Ring Spinning')
    .setAwareTokenType('Yarn')
    .setMaterialSpecification('16/1s')
    .setMainColor('#FFA500', 'Orange')
    .setProductionLotBatchNo('77839H8873')
    .setTotalWeight(8500)
    .setSustainableProcessClaims(false)
    .setWetProcessing(false)
    .addMaterial({
      compositionMaterial: 'Cotton',
      percentage: 100,
      sustainable: true,
      sustainabilityClaim: 'Recycled',
      feedstockRecycledMaterials: 'PostConsumer'
    })
    .setAwareAssetId('tiancheng - Yarn - 13213 - 100% Recycled Cotton(Post-Consumer) - Light Blue - 6564654523')
    .setValidationMethod('SelfValidation')
    .build();
  
  try {
    // Submit naar API
    const result = await sdk.createSubmission(submission);
    console.log('✅ Submission succesvol aangemaakt!');
    console.log('📋 Submission ID:', result.submissionId);
    console.log('📊 Data opgeslagen in spreadsheet');
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run voorbeeld
if (require.main === module) {
  basicExample()
    .then(() => console.log('\n✨ Klaar!'))
    .catch(err => console.error('\n💥 Mislukt:', err));
}

module.exports = basicExample;
