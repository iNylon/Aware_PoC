# Aware™ Platform

Een geïntegreerd platform voor Aware™ material tracking met AI-ondersteuning via Ollama en automatische data opslag naar Excel.

## Kenmerken

- 🤖 **Ollama AI Integratie**: Lokale AI voor het voorspellen en automatisch invullen van formulierdata
- 📊 **Excel Opslag**: Automatische opslag van alle submissions naar Excel spreadsheets
- 🌐 **REST API**: Volledige API voor het ophalen, zoeken en exporteren van data
- 💻 **Web Interface**: Gebruiksvriendelijke interface voor het maken en updaten van tokens
- 🔍 **SDK**: JavaScript SDK voor eenvoudige integratie

## Vereisten

- Node.js (v14 of hoger)
- Ollama geïnstalleerd en draaiend
- Ollama model: llama3.2:3b (of een ander model naar keuze)

## Installatie

1. Installeer dependencies:
```bash
cd aware-platform
npm install
```

2. Installeer en start Ollama:
```bash
# Installeer Ollama van https://ollama.ai
ollama serve

# In een nieuwe terminal:
ollama pull llama3.2:3b
```

3. Start de server:
```bash
npm start
```

4. Open je browser op: http://localhost:3000

## Mappenstructuur

```
aware-platform/
├── src/                    # Server-side code
│   ├── index.js           # Gecombineerde server (Ollama AI + Excel API)
│   ├── models/            # Data modellen
│   │   └── FormData.js
│   └── storage/           # Opslag laag
│       └── SpreadsheetStorage.js
├── web/                   # Client-side bestanden
│   ├── index.html
│   ├── create_token.html  # Token creatie met AI + opslag
│   ├── update_token.html  # Token update met AI + opslag
│   ├── wallet.html
│   ├── aware-style.css
│   ├── batches.js
│   └── aware-sdk.js       # Client SDK
├── examples/              # Voorbeeld integraties
├── shared-data/           # Excel opslag locatie
└── package.json
```

## Gebruik

### Web Interface

1. **Create Token**: Maak nieuwe tokens met AI-ondersteuning
   - Selecteer een vorige batch voor AI-voorspelling
   - Beschrijf de verschillen
   - Klik op "Predict with AI" voor automatische invulling
   - Controleer en pas aan waar nodig
   - Submit om op te slaan naar Excel

2. **Update Token**: Update bestaande tokens
   - Selecteer de batch om te updaten
   - Gebruik AI voor wijzigingen voorspellen
   - Update en sla op

### API Endpoints

```
GET  /api                     - Health check
POST /api/predict             - Ollama AI voorspelling
GET  /api/submissions         - Haal alle submissions op
GET  /api/submissions/:id     - Haal specifieke submission op
POST /api/submissions         - Maak nieuwe submission
POST /api/submissions/search  - Zoek submissions
GET  /api/export/csv          - Export naar CSV
GET  /api/export/xlsx         - Download Excel bestand
```

### SDK Gebruik

```javascript
// Initialiseer SDK
const sdk = new AwareSDK('http://localhost:3000');

// Maak een submission
const submission = await sdk.createSubmission({
  date: '2026-01-19',
  productionFacility: 'Factory A',
  totalWeightKgs: 1000,
  // ... meer velden
});

// Haal alle submissions op
const all = await sdk.getAllSubmissions();

// Zoek submissions
const results = await sdk.searchSubmissions({
  'Production Facility': 'Factory A'
});
```

## Functies

### Ollama AI Integratie
- Automatische voorspelling van formulierdata gebaseerd op vorige batches
- Lokaal draaiend, geen cloud verbinding nodig
- Configureerbaar model (standaard: llama3.2:3b)

### Excel Opslag
- Automatische opslag van alle submissions
- Meerdere sheets voor gedetailleerde data:
  - Submissions: Hoofdgegevens
  - Materials: Materiaal compositie details
  - Validation Sources: Validatie bronnen
- Export naar CSV en XLSX

### Data Validatie
- Automatische validatie van verplichte velden
- Materiaal percentage controle
- Type checking voor alle velden

## Configuratie

### Ollama Model Wijzigen

In `src/index.js`:
```javascript
const OLLAMA_URL = 'http://localhost:11434';
// Wijzig model in de /api/predict endpoint:
model: 'llama3.2:3b'  // Verander naar jouw model
```

### Excel Bestand Locatie

Standaard: `shared-data/submissions.xlsx`

Wijzig in `src/index.js`:
```javascript
const sharedDataPath = path.join(__dirname, '..', 'shared-data', 'submissions.xlsx');
```

## Troubleshooting

### Ollama verbinding mislukt
```bash
# Controleer of Ollama draait
ollama serve

# Test de verbinding
curl http://localhost:11434/api/generate
```

### Excel bestand niet aangemaakt
- Controleer schrijfrechten in de `shared-data/` map
- Map wordt automatisch aangemaakt bij eerste opslag

### API niet bereikbaar
- Controleer of de server draait op poort 3000
- Controleer firewall instellingen

## Licentie

MIT
