# Aware™ Platform - Blockchain Integratie

## Overzicht

Het Aware™ Platform combineert:
- 🤖 **Ollama AI** voor batch voorspellingen (llama3.2:3b model)
- 📊 **Excel Opslag** voor data persistentie
- ⛓️ **Blockchain** voor transparante batch tracking en goedkeuringen

## Blockchain Features

### Smart Contract: SupplyChain.sol
Het platform gebruikt een Ethereum smart contract voor:
- **Batch Registratie**: Registreer batches met data hashes op de blockchain
- **Goedkeuringsworkflow**: Approve/Reject/Certify workflow voor batches
- **Gebruikersbeheer**: Registreer gebruikers met naam en rol
- **Transparantie**: Alle acties zijn permanent en verifieerbaar op de blockchain

### Batch Statussen
- **Pending (0)**: Batch is geregistreerd, wacht op goedkeuring
- **Approved (1)**: Batch is goedgekeurd, kan worden gecertificeerd
- **Rejected (2)**: Batch is afgekeurd
- **Certified (3)**: Batch is gecertificeerd met officiële documentatie

## Installatie & Setup

### 1. Dependencies Installeren
```bash
cd C:\Aware_PoC\aware-platform
npm install
```

### 2. Blockchain Node Starten (Terminal 1)
Start een lokale Hardhat blockchain node:
```bash
npm run blockchain:node
```

Dit start een lokale Ethereum node op `http://127.0.0.1:8545` met test accounts.

### 3. Smart Contract Deployen (Terminal 2)
Deploy het SupplyChain contract:
```bash
npm run blockchain:deploy
```

Dit deployed het contract en toont het contract address. Kopieer dit address!

### 4. Contract Address Opslaan
1. Kopieer het deployment address uit de terminal output
2. Maak een `.env` bestand (kopieer van `.env.example`):
   ```bash
   cp .env.example .env
   ```
3. Vul het contract address in:
   ```
   CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   NETWORK_URL=http://127.0.0.1:8545
   ```

### 5. Server Starten (Terminal 3)
Start de Aware™ server:
```bash
npm start
```

Server draait op `http://localhost:3000`

### 6. Ollama AI Starten (Terminal 4 - optioneel)
Voor AI functionaliteit, zorg dat Ollama draait:
```bash
ollama serve
```

En download het model (eenmalig):
```bash
ollama pull llama3.2:3b
```

## Gebruik

### Web Interface
Open `http://localhost:3000` in je browser en navigeer naar:

1. **Blockchain Dashboard** (`blockchain.html`)
   - Connect je MetaMask wallet
   - Registreer jezelf op de blockchain
   - Bekijk blockchain status en contract informatie

2. **Create Token** (`create_token.html`)
   - Gebruik AI om batch data te voorspellen
   - Maak nieuwe batches aan
   - Data wordt opgeslagen in Excel én op de blockchain

3. **View Batches** (`batches.html`)
   - Bekijk alle blockchain batches
   - Filter op status en batch ID
   - Zie real-time blockchain status

4. **Approve Batches** (`batch_approve.html`)
   - Keur batches goed of af
   - Certificeer goedgekeurde batches
   - Alle acties worden geregistreerd op blockchain

### MetaMask Setup
1. Installeer [MetaMask](https://metamask.io/) browser extensie
2. Voeg lokaal Hardhat netwerk toe:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

3. Importeer een test account:
   - Gebruik een private key van de Hardhat node output
   - Voorbeeld: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## API Endpoints

### Blockchain API
- `GET /api/blockchain/info` - Blockchain status en contract info
- `POST /api/blockchain/register` - Registreer gebruiker
- `POST /api/blockchain/batch/create` - Registreer nieuwe batch
- `GET /api/blockchain/batches` - Haal alle batches op
- `POST /api/blockchain/batch/approve` - Keur batch goed
- `POST /api/blockchain/batch/reject` - Keur batch af
- `POST /api/blockchain/batch/certify` - Certificeer batch

### AI API
- `POST /api/predict` - Vraag AI voorspelling

### Data API
- `POST /api/submissions` - Sla data op in Excel
- `GET /api/submissions` - Haal alle submissions op
- `GET /api/export/csv` - Export naar CSV
- `GET /api/export/excel` - Export naar Excel

## Troubleshooting

### "Blockchain Not Ready"
- Controleer of Hardhat node draait (`npm run blockchain:node`)
- Deploy het contract (`npm run blockchain:deploy`)
- Herstart de server om het contract address te detecteren

### "MetaMask Connection Failed"
- Zorg dat MetaMask is geïnstalleerd
- Voeg het Hardhat Local netwerk toe (Chain ID: 31337)
- Controleer of je op het juiste netwerk zit

### "Transaction Failed"
- Controleer of je account voldoende ETH heeft (Hardhat geeft test ETH)
- Kijk of het contract address correct is in `.env`
- Check de browser console voor error details

### "Ollama API Error"
- Start Ollama: `ollama serve`
- Download het model: `ollama pull llama3.2:3b`
- Check of Ollama draait op `http://localhost:11434`

## Project Structuur

```
aware-platform/
├── contracts/              # Solidity smart contracts
│   └── SupplyChain.sol    # Main supply chain contract
├── scripts/               # Deployment scripts
│   └── deploy.js          # Contract deployment
├── src/                   # Backend server
│   ├── index.js          # Main server (ES modules)
│   ├── models/           # Data models
│   └── storage/          # Excel storage layer
├── web/                   # Frontend HTML/CSS/JS
│   ├── blockchain.html   # Blockchain dashboard
│   ├── batches.html      # Batch overview
│   ├── batch_approve.html # Approval interface
│   ├── create_token.html # Token creator with AI
│   ├── update_token.html # Token updater
│   ├── wallet.html       # Token wallet
│   ├── index.html        # Home page
│   ├── aware-style.css   # Unified CSS (wit/grijs/bruin/oranje)
│   └── aware-sdk.js      # Client SDK
├── hardhat.config.js      # Hardhat configuration
├── package.json          # Dependencies & scripts
└── .env                  # Environment variables (create from .env.example)
```

## Design System

Het platform gebruikt een consistente design language:
- **Kleuren**: Wit (#F5F5F5), Grijs, Bruin (#290800), Oranje (#FF3300)
- **Typografie**: Inter font family
- **Components**: Cards, buttons, forms met uniforme styling
- **Layout**: Sidebar navigation + main content area

## Ontwikkeling

### Watch Mode
```bash
npm run dev
```

### Tests
```bash
npm test
```

### Hardhat Console
```bash
npx hardhat console --network localhost
```

## Licentie

© 2024 Aware™ - Alle rechten voorbehouden
