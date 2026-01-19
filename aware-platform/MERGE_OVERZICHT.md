# Aware™ Platform - Samenvoeg Overzicht

## Wat is er gedaan?

De twee mappen `AI_Integratie_ConceptmetDylan` en `api+bad_ai` zijn samengevoegd tot één geïntegreerde `aware-platform`.

## Nieuwe Mappenstructuur

```
C:\Aware_PoC\
└── aware-platform/           ✨ NIEUWE GECOMBINEERDE MAP
    ├── src/                  
    │   ├── index.js         🔀 Gecombineerde server (Ollama + Excel API)
    │   ├── models/
    │   │   └── FormData.js  📋 Van api+bad_ai
    │   └── storage/
    │       └── SpreadsheetStorage.js  💾 Van api+bad_ai
    │
    ├── web/                 
    │   ├── index.html       🏠 Van AI_Integratie
    │   ├── wallet.html      💰 Van AI_Integratie
    │   ├── create_token.html   ⭐ Gecombineerd (AI + opslag)
    │   ├── update_token.html   ⭐ Gecombineerd (AI + opslag)
    │   ├── aware-style.css  🎨 Van AI_Integratie
    │   ├── batches.js       📊 Van AI_Integratie
    │   └── aware-sdk.js     🔌 Van api+bad_ai
    │
    ├── examples/            📚 Van api+bad_ai
    ├── shared-data/         💾 Excel opslag locatie
    ├── package.json         📦 Gecombineerde dependencies
    ├── README.md            📖 Volledige documentatie
    ├── SNELSTART.txt        🚀 Quick start gids
    └── start.bat            ▶️ Start script
```

## Functionaliteiten

### ✅ Van AI_Integratie_ConceptmetDylan
- ✨ Ollama AI integratie voor voorspellingen
- 🎨 Visuele vormgeving (aware-style.css)
- 📄 create_token.html en update_token.html interfaces
- 🏠 index.html en wallet.html pagina's
- 📊 batches.js voor batch beheer

### ✅ Van api+bad_ai
- 💾 Excel opslag functionaliteit (SpreadsheetStorage)
- 📋 Data modellen (FormData)
- 🔌 Aware SDK voor API communicatie
- 📊 REST API endpoints
- 📚 Voorbeelden en documentatie

### 🔀 Gecombineerd in aware-platform
- **create_token.html**: Behoud visuele vormgeving + Ollama AI + Excel opslag
- **update_token.html**: Behoud visuele vormgeving + Ollama AI + Excel opslag
- **src/index.js**: Server met zowel Ollama AI endpoints als Excel API endpoints

## Wat werkt nu?

### 1. Ollama AI Voorspellingen ✅
- Endpoint: `POST /api/predict`
- Gebruikt lokale Ollama voor AI voorspellingen
- Automatisch invullen van formulierdata

### 2. Excel Opslag ✅
- Endpoint: `POST /api/submissions`
- Automatische opslag naar Excel spreadsheet
- Meerdere sheets voor gedetailleerde data

### 3. Web Interface ✅
- Zelfde look & feel als AI_Integratie versie
- AI functionaliteit volledig behouden
- Data wordt nu ook opgeslagen naar Excel

### 4. API Functionaliteit ✅
- `GET /api/submissions` - Haal alle submissions op
- `GET /api/submissions/:id` - Haal specifieke submission op
- `POST /api/submissions/search` - Zoek submissions
- `GET /api/export/csv` - Export naar CSV
- `GET /api/export/xlsx` - Download Excel bestand

## Belangrijkste Wijzigingen

### create_token.html & update_token.html
**Toegevoegd:**
```html
<script src="aware-sdk.js"></script>
```

**submitData() functie uitgebreid:**
- Verzamelt alle formulierdata
- Valideert verplichte velden
- Verstuurt data naar API voor Excel opslag
- Toont success/error meldingen met API feedback

### src/index.js
**Gecombineerde functionaliteit:**
1. **Ollama AI endpoint** (`/api/predict`):
   - Ontvangt AI verzoeken
   - Stuurt naar Ollama
   - Retourneert voorspellingen

2. **Excel API endpoints** (alle `/api/submissions/*`):
   - Opslag naar Excel
   - Ophalen van data
   - Zoeken en filteren
   - Export functionaliteit

3. **Statische bestanden**:
   - Serveert alle web bestanden
   - Eén server voor alles

## Hoe te Gebruiken

1. **Start de server:**
   ```
   cd aware-platform
   npm install
   npm start
   ```

2. **Zorg dat Ollama draait:**
   ```
   ollama serve
   ```

3. **Open de browser:**
   ```
   http://localhost:3000
   ```

## Voordelen van de Merge

✅ **Geen dubbele bestanden** - Alles is georganiseerd in één map
✅ **Logische structuur** - src/ voor server, web/ voor client
✅ **Beide functionaliteiten** - AI én Excel opslag werken samen
✅ **Zelfde UI** - Visuele vormgeving is behouden
✅ **Één server** - Eén poort, één applicatie
✅ **Complete documentatie** - README en SNELSTART.txt

## Oude Mappen

De originele mappen kunnen nu verwijderd worden:
- ❌ `AI_Integratie_ConceptmetDylan/` - Vervangen door aware-platform
- ❌ `api+bad_ai/` - Vervangen door aware-platform

**Bewaar wel backups als je wilt!**

## Excel Output

Data wordt opgeslagen in:
```
aware-platform/shared-data/submissions.xlsx
```

Met 3 sheets:
1. **Submissions** - Alle hoofdgegevens
2. **Materials** - Materiaal compositie details  
3. **Validation Sources** - Validatie bronnen

## Troubleshooting

Zie `README.md` voor uitgebreide troubleshooting instructies.

Snelle checks:
- ✅ Server draait op poort 3000
- ✅ Ollama draait op poort 11434
- ✅ Browser kan localhost:3000 bereiken
- ✅ Console (F12) toont geen errors
