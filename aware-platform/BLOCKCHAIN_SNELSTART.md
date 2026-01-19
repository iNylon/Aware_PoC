# 🚀 Aware™ Platform - Snelstart Gids

## ✅ Status: Blockchain Integratie Compleet!

Het Aware™ Platform is nu volledig uitgebreid met blockchain functionaliteit terwijl het huidige design (wit, grijs, bruin, oranje) behouden is gebleven.

## 🎯 Nieuwe Features

### 1. Blockchain Dashboard (`blockchain.html`)
- MetaMask wallet connectie
- Blockchain status monitoring
- Contract informatie weergave
- Gebruikersregistratie op blockchain

### 2. Batch Overzicht (`batches.html`)
- Overzicht van alle blockchain batches
- Real-time status updates (Pending, Approved, Rejected, Certified)
- Filters op batch ID en status
- Sorteer opties (nieuwste, oudste, batch ID)
- Quick actions per batch

### 3. Batch Goedkeuring (`batch_approve.html`)
- Approve/Reject/Certify workflow
- Automatische wallet connectie check
- Overzicht pending en approved batches
- Transaction confirmatie met hashes
- Certificatie met IPFS-compatible hashes

## 🚀 Opstarten

### Optie A: Alleen Server (zonder blockchain)
```bash
cd C:\Aware_PoC\aware-platform
npm start
```
Open: http://localhost:3000

### Optie B: Volledige Stack (met blockchain)

#### Terminal 1 - Hardhat Node
```bash
cd C:\Aware_PoC\aware-platform
npm run blockchain:node
```

#### Terminal 2 - Contract Deployen
```bash
cd C:\Aware_PoC\aware-platform
npm run blockchain:deploy
```
**BELANGRIJK:** Kopieer het contract address uit de output!

#### Terminal 3 - .env Configureren
1. Maak `.env` bestand:
   ```bash
   cp .env.example .env
   ```

2. Vul het contract address in (uit terminal 2):
   ```
   CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

#### Terminal 4 - Server Starten
```bash
cd C:\Aware_PoC\aware-platform
npm start
```

#### Browser - MetaMask Setup
1. Installeer MetaMask
2. Voeg netwerk toe:
   - Network: Hardhat Local
   - RPC: http://127.0.0.1:8545
   - Chain ID: 31337
   - Symbol: ETH

3. Importeer test account (private key uit terminal 1)

## 📁 Nieuwe Bestanden

### Frontend (web/)
- ✅ `blockchain.html` - Dashboard voor wallet en registratie
- ✅ `batches.html` - Blockchain batch overzicht
- ✅ `batch_approve.html` - Goedkeurings interface

### Backend (src/)
- ✅ `index.js` - Nieuwe ES modules server met blockchain endpoints

### Configuratie
- ✅ `.env.example` - Environment variabelen template
- ✅ `BLOCKCHAIN_README.md` - Uitgebreide documentatie

## 🎨 Design Behouden

Alle nieuwe pagina's gebruiken:
- ✅ Bestaande `aware-style.css` (wit/grijs/bruin/oranje)
- ✅ Zelfde sidebar navigatie structuur
- ✅ Consistente buttons en forms
- ✅ Identieke page headers en layouts
- ✅ Aware™ logo en branding

## 🔗 Navigatie Bijgewerkt

Sidebar in ALLE pagina's nu bevat:
- Home
- Wallet
- Create Token
- Update Token
- **Blockchain Dashboard** ⬅️ NIEUW
- **View Batches** ⬅️ NIEUW
- **Approve Batches** ⬅️ NIEUW

## 🔌 API Endpoints

### Nieuwe Blockchain Endpoints
```
GET  /api/blockchain/info              - Status en contract info
POST /api/blockchain/register          - Registreer gebruiker
POST /api/blockchain/batch/create      - Nieuwe batch op blockchain
GET  /api/blockchain/batches           - Alle batches ophalen
POST /api/blockchain/batch/approve     - Batch goedkeuren
POST /api/blockchain/batch/reject      - Batch afkeuren
POST /api/blockchain/batch/certify     - Batch certificeren
```

### Bestaande Endpoints
```
POST /api/predict                      - Ollama AI voorspelling
POST /api/submissions                  - Data opslaan in Excel
GET  /api/submissions                  - Data ophalen
GET  /api/export/csv                   - CSV export
GET  /api/export/excel                 - Excel export
```

## ✅ Checklist: Wat is er gedaan?

- ✅ Server geconverteerd naar ES modules (voor ethers.js compatibility)
- ✅ Blockchain dependencies geïnstalleerd (ethers, hardhat, etc.)
- ✅ Smart contract en deployment scripts gekopieerd
- ✅ Drie nieuwe HTML pagina's gemaakt met current design
- ✅ Sidebar navigatie bijgewerkt in alle bestanden
- ✅ Blockchain API endpoints toegevoegd aan server
- ✅ .env.example bijgewerkt met blockchain settings
- ✅ Uitgebreide documentatie gemaakt
- ✅ Server getest en draait op localhost:3000

## 🎯 Volgende Stappen

1. **Start blockchain** (zie Optie B hierboven)
2. **Test de nieuwe pagina's**:
   - http://localhost:3000/blockchain.html
   - http://localhost:3000/batches.html
   - http://localhost:3000/batch_approve.html

3. **Maak een batch aan** via Create Token pagina
4. **Goedkeuren** via Approve Batches pagina
5. **Certificeren** de goedgekeurde batch

## 💡 Tips

- Hardhat node geeft 20 test accounts met elk 10,000 ETH
- Transactions zijn instant op lokaal netwerk
- Browser console toont gedetailleerde error messages
- Smart contract source: `contracts/SupplyChain.sol`

## 📚 Documentatie

- **Uitgebreid**: `BLOCKCHAIN_README.md`
- **Origineel**: `README.md` (Ollama + Excel)
- **Installatie**: `INSTALLATIE_INSTRUCTIES.txt`

## ✨ Gereed voor Productie!

Het platform is nu klaar met:
- ✅ AI voorspellingen (Ollama)
- ✅ Data persistentie (Excel)
- ✅ Blockchain traceability (Hardhat/Ethereum)
- ✅ Consistent design (wit/grijs/bruin/oranje)
- ✅ Complete workflow (create → approve → certify)

**Veel succes met je blockchain-enabled Aware™ Platform! 🚀**
