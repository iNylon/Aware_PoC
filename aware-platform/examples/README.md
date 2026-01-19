# 📚 API Integration Examples

Deze folder bevat praktische voorbeelden van hoe je de Aware Material Tracking API kunt integreren.

## 🎯 Beschikbare Voorbeelden

### 1. Simple Integration Example (HTML/JavaScript)
**Bestand**: `simple-integration-example.html`

Een volledig werkend voorbeeld met een eenvoudig formulier dat direct met de API communiceert.

**Gebruik**:
1. Start de API server: `cd .. && npm start`
2. Open `simple-integration-example.html` in je browser
3. Vul het formulier in en klik "Submit to API"
4. Bekijk de response van de API

**Functionaliteit**:
- ✅ API status check
- ✅ Formulier met basisvelden
- ✅ Real-time submission naar API
- ✅ Response weergave
- ✅ Error handling

---

### 2. Basic Example (Node.js)
**Bestand**: `example-basic.js`

Basis voorbeeld van het gebruik van de SDK in Node.js.

**Gebruik**:
```bash
node example-basic.js
```

**Wat het doet**:
- Maak een nieuwe submission
- Print submission ID
- Print success/error

---

### 3. Search Example (Node.js)
**Bestand**: `example-search.js`

Voorbeeld van zoeken in submissions.

**Gebruik**:
```bash
node example-search.js
```

**Wat het doet**:
- Maak meerdere test submissions
- Zoek submissions met criteria
- Filter op productie faciliteit
- Filter op gewicht

---

### 4. Self Validation Example (Node.js)
**Bestand**: `example-self-validation.js`

Uitgebreid voorbeeld met self-validation documentatie.

**Gebruik**:
```bash
node example-self-validation.js
```

**Wat het doet**:
- Maak submission met volledige self-validation
- Meerdere bronnen/suppliers
- Documentatie referenties
- Certificaten

---

### 5. Tracer Example (Node.js)
**Bestand**: `example-with-tracer.js`

Voorbeeld met tracer informatie (Aware en Custom).

**Gebruik**:
```bash
node example-with-tracer.js
```

**Wat het doet**:
- Submission met Aware tracer
- Submission met Custom tracer
- Tracer documentatie
- Scan datum en rapporten

---

### 6. Browser Example (HTML)
**Bestand**: `browser-example.html`

Volledig browser voorbeeld met Aware SDK.

**Gebruik**:
1. Start API server
2. Open `browser-example.html` in browser
3. Open Developer Console (F12)
4. Zie voorbeelden draaien

---

## 🚀 Quick Start

### Stap 1: Start de API Server
```bash
cd ..
npm install  # Alleen eerste keer
npm start
```

De API draait nu op `http://localhost:3000`

### Stap 2: Run een Voorbeeld

**Node.js voorbeelden**:
```bash
node example-basic.js
node example-search.js
node example-self-validation.js
node example-with-tracer.js
```

**HTML voorbeelden**:
- Open `simple-integration-example.html` in je browser
- Open `browser-example.html` in je browser

---

## 📋 Data Structuur

Alle voorbeelden gebruiken deze basis structuur:

```javascript
{
  // Verplichte velden
  date: '2024-01-19',
  productionFacility: 'Factory Name',
  valueChainProcessMain: 'Spinning',
  valueChainProcessSub: 'Ring Spinning',
  materialSpecification: '16/1s',
  mainColorSelected: '#FFA500',
  mainColorText: 'Orange',
  productionLotBatchNo: 'BATCH-123',
  totalWeightKgs: 1000,
  
  // Materialen (minimaal 1)
  materials: [
    {
      compositionMaterial: 'Organic Cotton',
      percentage: 100,
      sustainable: true,
      sustainabilityClaim: 'GOTS Certified'
    }
  ],
  
  // Validatie methode
  validationMethod: 'SelfValidation',
  
  // Optionele velden
  sustainableProcessClaims: true,
  wetProcessing: false,
  awareAssetId: 'asset-id',
  tracerAdded: true,
  typeOfTracer: 'Aware',
  certificates: {
    environmental: ['GOTS', 'GRS'],
    social: [],
    chemical: []
  }
}
```

---

## 🔍 Testing

### Test of API draait:
```bash
curl http://localhost:3000
```

Verwachte response:
```json
{
  "message": "Aware Material Tracking API",
  "version": "1.0.0",
  "status": "running"
}
```

### Test submission:
```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

---

## 🛠️ Eigen Integratie Maken

### JavaScript/Node.js
```javascript
const { AwareSDK } = require('../sdk/aware-sdk.js');
const sdk = new AwareSDK('http://localhost:3000');

// Jouw code hier
const result = await sdk.createSubmission({
  // Jouw data
});
```

### Browser
```html
<script src="path/to/aware-sdk.js"></script>
<script>
  const sdk = new AwareSDK('http://localhost:3000');
  // Jouw code hier
</script>
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:3000/api/submissions',
    json={
        # Jouw data
    }
)
```

### PHP
```php
$ch = curl_init('http://localhost:3000/api/submissions');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$result = curl_exec($ch);
```

---

## 📖 Meer Informatie

- **Volledige API Gids**: Zie `../API_INTEGRATION_GUIDE.md`
- **Technische Docs**: Zie `../INTEGRATION_README.md`
- **Quick Start**: Zie `../QUICK_START.md`

---

## 💡 Tips

1. **Altijd valideren**: Check je data voordat je submit
2. **Error handling**: Gebruik try/catch voor alle API calls
3. **Retry logic**: Implementeer retry bij netwerk fouten
4. **Batch processing**: Wacht tussen requests bij bulk operations
5. **Logging**: Log alle API calls voor debugging

---

## 🐛 Troubleshooting

**"API Request failed"**
- Check of API server draait (`npm start`)
- Check of URL correct is (`http://localhost:3000`)

**"Validation errors"**
- Check of alle verplichte velden zijn ingevuld
- Check of material percentages totaal 100% zijn

**CORS errors (browser)**
- API heeft CORS enabled, zou moeten werken
- Als probleem: gebruik server-side integratie

**"Module not found"**
- Run `npm install` in de apiPoc folder

---

## 📞 Support

Voor vragen of problemen, check:
1. De console/terminal output voor error messages
2. Browser Developer Console (F12) voor client-side errors
3. API server logs voor server-side errors
4. De documentatie bestanden in de parent folder

---

Happy coding! 🚀
