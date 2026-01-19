/**
 * Voorbeeld: Submissions zoeken en ophalen
 */

const { AwareSDK } = require('../sdk/aware-sdk.js');

async function searchExample() {
  const sdk = new AwareSDK('http://localhost:3000');
  
  try {
    console.log('🔍 Zoeken naar submissions...\n');
    
    // Alle submissions ophalen
    console.log('1️⃣  Alle submissions:');
    const all = await sdk.getAllSubmissions();
    console.log(`   Totaal: ${all.count} submissions\n`);
    
    // Zoek op productie faciliteit
    console.log('2️⃣  Zoeken op productie faciliteit:');
    const byFacility = await sdk.searchSubmissions({
      'Production Facility': 'Tiancheng Factory'
    });
    console.log(`   Gevonden: ${byFacility.count} submissions van Tiancheng Factory\n`);
    
    // Zoek op token type
    console.log('3️⃣  Zoeken op token type:');
    const byTokenType = await sdk.searchSubmissions({
      'Aware Token Type': 'Yarn'
    });
    console.log(`   Gevonden: ${byTokenType.count} submissions met token type Yarn\n`);
    
    // Zoek op validation method
    console.log('4️⃣  Zoeken op validatie methode:');
    const bySelfValidation = await sdk.searchSubmissions({
      'Validation Method': 'SelfValidation'
    });
    console.log(`   Gevonden: ${bySelfValidation.count} submissions met self-validation\n`);
    
    // Zoek op meerdere criteria
    console.log('5️⃣  Zoeken op meerdere criteria:');
    const multiSearch = await sdk.searchSubmissions({
      'Production Facility': 'Tiancheng Factory',
      'Aware Token Type': 'Yarn',
      'Tracer Added': 'Yes'
    });
    console.log(`   Gevonden: ${multiSearch.count} Yarn submissions van Tiancheng met tracer\n`);
    
    // Haal specifieke submission op (indien er resultaten zijn)
    if (all.count > 0) {
      const firstSubmission = all.data[0];
      console.log('6️⃣  Details van eerste submission:');
      const details = await sdk.getSubmission(firstSubmission['Submission ID']);
      console.log('   Submission ID:', details.data['Submission ID']);
      console.log('   Datum:', details.data['Date']);
      console.log('   Faciliteit:', details.data['Production Facility']);
      console.log('   Batch No:', details.data['Production Lot/Batch No.']);
      console.log('   Gewicht:', details.data['Total Weight (Kgs)'], 'kg\n');
    }
    
    // Export URLs
    console.log('7️⃣  Export URLs:');
    console.log('   CSV:', sdk.getCSVExportURL());
    console.log('   Excel:', sdk.getExcelExportURL());
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run voorbeeld
if (require.main === module) {
  searchExample()
    .then(() => console.log('\n✨ Klaar!'))
    .catch(err => console.error('\n💥 Mislukt:', err));
}

module.exports = searchExample;
