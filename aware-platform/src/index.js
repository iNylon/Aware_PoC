import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import fs from 'fs';
import dotenv from 'dotenv';
import session from 'express-session';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_URL = 'http://localhost:11434';

// Blockchain setup
let provider;
let contract;
let contractAddress;
let contractABI;
let blockchainReady = false;

// Wallet for server-side transactions (will create wallets for each logged-in user)
const userWallets = new Map(); // username -> { wallet, address }

// Token balances tracking per user
const userTokenBalances = new Map(); // username -> { pellet, fiber, yarn, fabric, product }

// Initialize token balance for a user
function initializeTokenBalance(username) {
  if (!userTokenBalances.has(username)) {
    userTokenBalances.set(username, {
      pellet: 0,
      fiber: 0,
      yarn: 0,
      fabric: 0,
      product: 0
    });
  }
}

// Add tokens to user balance based on token type and weight
function addTokensToUser(username, tokenType, weight) {
  initializeTokenBalance(username);
  const balances = userTokenBalances.get(username);
  
  const normalizedType = (tokenType || '').toLowerCase();
  
  if (normalizedType.includes('pellet')) {
    balances.pellet += weight;
  } else if (normalizedType.includes('fiber')) {
    balances.fiber += weight;
  } else if (normalizedType.includes('yarn')) {
    balances.yarn += weight;
  } else if (normalizedType.includes('fabric')) {
    balances.fabric += weight;
  } else if (normalizedType.includes('product')) {
    balances.product += weight;
  } else {
    // Default to yarn if type not recognized
    balances.yarn += weight;
  }
  
  userTokenBalances.set(username, balances);
}

// Load blockchain contract
function loadContract() {
  try {
    const deploymentPath = path.join(__dirname, '..', 'deployment.json');
    const abiPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'SupplyChain.sol', 'SupplyChain.json');

    if (fs.existsSync(deploymentPath) && fs.existsSync(abiPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      contractAddress = deployment.contractAddress;
      
      const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      contractABI = contractJson.abi;

      provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
      contract = new ethers.Contract(contractAddress, contractABI, provider);

      console.log('✅ Blockchain contract loaded at:', contractAddress);
      blockchainReady = true;
      return true;
    } else {
      console.log('⚠️  Blockchain contract not deployed yet.');
      console.log('   Run: npm run blockchain:node (in separate terminal)');
      console.log('   Then: npm run blockchain:deploy');
      blockchainReady = false;
      return false;
    }
  } catch (error) {
    console.error('Error loading contract:', error.message);
    blockchainReady = false;
    return false;
  }
}

// Session middleware - MUST be before CORS
app.use(session({
  secret: 'aware-blockchain-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serveer statische bestanden uit de web map
app.use(express.static(path.join(__dirname, '..', 'web')));

// Serveer de examples folder
app.use('/examples', express.static(path.join(__dirname, '..', 'examples')));

// Try to load blockchain contract
loadContract();

// ==================== AUTH ENDPOINTS ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    const { username, password, role } = req.body;
    
    if (!username || !password || role === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a new wallet for this user
    const wallet = ethers.Wallet.createRandom().connect(provider);
    
    // Get some ETH from account 0 for gas
    const funder = await provider.getSigner(0); // Use index instead of account object
    const fundTx = await funder.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther("1.0")
    });
    await fundTx.wait();

    // Register user on blockchain
    const contractWithSigner = contract.connect(wallet);
    const tx = await contractWithSigner.registerUser(username, password, role);
    await tx.wait();

    // Store wallet in memory (in production, use encrypted database!)
    userWallets.set(username, {
      wallet: wallet,
      address: wallet.address,
      privateKey: wallet.privateKey
    });

    res.json({
      success: true,
      message: 'User registered successfully',
      address: wallet.address
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Verify credentials on blockchain
    const result = await contract.verifyLogin(username, password);
    const success = result[0];
    const userAddress = String(result[1]); // Convert to string
    const returnedUsername = result[2];
    const role = result[3];

    if (!success) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get or create wallet for this user
    let userWallet = userWallets.get(username);
    if (!userWallet) {
      // User exists on blockchain but not in server memory (e.g., test users from deploy script)
      // Create a new wallet for server-side operations
      console.log(`Creating server wallet for existing blockchain user: ${username}`);
      
      const wallet = ethers.Wallet.createRandom().connect(provider);
      
      // Fund the wallet with 1 ETH for gas
      const funder = await provider.getSigner(0); // Use index instead of account object
      const fundTx = await funder.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther("1.0")
      });
      await fundTx.wait();
      
      // Register the new wallet in the blockchain contract
      console.log(`Registering wallet ${wallet.address} for user ${username} in blockchain...`);
      const contractWithSigner = contract.connect(wallet);
      const registerTx = await contractWithSigner.registerUser(username + '_wallet', 'auto', role);
      await registerTx.wait();
      console.log(`✅ Wallet registered in blockchain for ${username}`);
      
      // Store wallet in memory
      userWallet = {
        wallet: wallet,
        address: wallet.address,
        privateKey: wallet.privateKey
      };
      userWallets.set(username, userWallet);
      
      console.log(`✅ Server wallet created for ${username} at ${wallet.address}`);
    }

    // Store session
    req.session.user = {
      username: returnedUsername,
      address: userAddress,
      role: Number(role)
    };

    res.json({
      success: true,
      user: {
        username: returnedUsername,
        address: userAddress,
        role: Number(role)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get current session
app.get('/api/auth/session', (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
});

// ==================== BATCH ENDPOINTS ====================

// API endpoint for creating batches (with API key or session auth)
app.post('/api/batch/submit', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    // Check authentication (session or API key)
    let username = null;
    
    if (req.session.user) {
      username = req.session.user.username;
    } else if (req.headers['x-api-key']) {
      // Simple API key auth - in production use proper API keys
      const apiKey = req.headers['x-api-key'];
      const user = users.find(u => u.apiKey === apiKey);
      if (user) {
        username = user.username;
      }
    } else if (req.body.username && req.body.password) {
      // Allow username/password in request body for API calls
      const user = users.find(u => u.username === req.body.username && u.password === req.body.password);
      if (user) {
        username = user.username;
      }
    }

    if (!username) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { physicalAsset, tracer, validation, compliance } = req.body;

    // Get user's wallet
    const userWallet = userWallets.get(username);
    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not found for user' });
    }

    // Create batch on blockchain with status PENDING (0)
    const contractWithSigner = contract.connect(userWallet.wallet);
    const tx = await contractWithSigner.createBatch(
      physicalAsset,
      tracer,
      validation,
      compliance
    );
    const receipt = await tx.wait();

    // Get batch ID from event
    const event = receipt.logs.find(log => {
      try {
        return contract.interface.parseLog(log).name === 'BatchCreated';
      } catch {
        return false;
      }
    });

    let batchId = 0;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      batchId = Number(parsed.args[0]);
    }

    res.json({
      success: true,
      batchId: batchId,
      status: 'pending',
      message: 'Batch submitted successfully and awaiting approval',
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Submit batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create batch (blockchain only)
app.post('/api/batches/create', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const { physicalAsset, tracer, validation, compliance } = req.body;

    // Get user's wallet
    const userWallet = userWallets.get(req.session.user.username);
    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not found' });
    }

    // Create batch on blockchain
    const contractWithSigner = contract.connect(userWallet.wallet);
    const tx = await contractWithSigner.createBatch(
      physicalAsset,
      tracer,
      validation,
      compliance
    );
    const receipt = await tx.wait();

    // Get batch ID from event
    const event = receipt.logs.find(log => {
      try {
        return contract.interface.parseLog(log).name === 'BatchCreated';
      } catch {
        return false;
      }
    });

    let batchId = 0;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      batchId = Number(parsed.args[0]);
    }

    res.json({
      success: true,
      batchId: batchId,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all batches
app.get('/api/batches', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    const batchIds = await contract.getAllBatchIds();
    const batches = [];

    for (const id of batchIds) {
      const batchId = Number(id);
      
      // Get all batch data
      const basicInfo = await contract.getBatchBasicInfo(batchId);
      const physicalAsset = await contract.getBatchPhysicalAsset(batchId);
      const tracer = await contract.getBatchTracer(batchId);
      const validation = await contract.getBatchValidation(batchId);
      const compliance = await contract.getBatchCompliance(batchId);
      const approvalInfo = await contract.getBatchApprovalInfo(batchId);

      batches.push({
        id: batchId,
        physicalAsset: {
          assetId: physicalAsset.assetId,
          material: physicalAsset.material,
          composition: physicalAsset.composition,
          weight: physicalAsset.weight,
          batchNumber: physicalAsset.batchNumber,
          productionDate: physicalAsset.productionDate,
          expiryDate: physicalAsset.expiryDate,
          color: physicalAsset.color || '',
          colorHex: physicalAsset.colorHex || '',
          productionFacility: physicalAsset.productionFacility || '',
          valueChainMain: physicalAsset.valueChainMain || '',
          valueChainSub: physicalAsset.valueChainSub || '',
          tokenType: physicalAsset.tokenType || '',
          materialSpec: physicalAsset.materialSpec || '',
          mainColor: physicalAsset.mainColor || '',
          sustainableClaims: physicalAsset.sustainableClaims || '',
          wetProcessing: physicalAsset.wetProcessing || ''
        },
        tracer: {
          supplier: tracer.supplier,
          farmLocation: tracer.farmLocation,
          country: tracer.country,
          gpsCoordinates: tracer.gpsCoordinates,
          certifications: tracer.certifications,
          harvestDate: tracer.harvestDate,
          tracerType: tracer.tracerType || '',
          tracerName: tracer.tracerName || '',
          tracerDate: tracer.tracerDate || '',
          tracerAdded: tracer.tracerAdded === 'true' || tracer.tracerAdded === true
        },
        validation: {
          qualityGrade: validation.qualityGrade,
          moistureContent: validation.moistureContent,
          contamination: validation.contamination,
          inspectionDate: validation.inspectionDate,
          inspector: validation.inspector,
          labResults: validation.labResults,
          validationType: validation.validationType || 'Self-Validation'
        },
        compliance: {
          regulatoryStandards: compliance.regulatoryStandards,
          sustainabilityCert: compliance.sustainabilityCert,
          fairTradeCert: compliance.fairTradeCert,
          organicCert: compliance.organicCert,
          carbonFootprint: compliance.carbonFootprint,
          waterUsage: compliance.waterUsage,
          selectedCerts: compliance.selectedCerts ? compliance.selectedCerts.split(',').map(s => s.trim()).filter(s => s) : []
        },
        // Parse JSON from blockchain storage
        suppliers: (() => {
          try {
            return tracer.gpsCoordinates && tracer.gpsCoordinates.startsWith('[') ? JSON.parse(tracer.gpsCoordinates) : [];
          } catch {
            return [];
          }
        })(),
        compositionDetails: (() => {
          try {
            return validation.labResults && validation.labResults.startsWith('[') ? JSON.parse(validation.labResults) : [];
          } catch {
            return [];
          }
        })(),
        validationDetails: (() => {
          try {
            return validation.moistureContent && validation.moistureContent.startsWith('[') ? JSON.parse(validation.moistureContent) : [];
          } catch {
            return [];
          }
        })(),
        createdBy: basicInfo[1],
        createdByName: basicInfo[2],
        createdByRole: Number(basicInfo[3]),
        createdAt: Number(basicInfo[4]),
        status: Number(basicInfo[5]),
        approvedBy: approvalInfo[0],
        approvedByName: approvalInfo[1],
        approvedAt: Number(approvalInfo[2]),
        rejectionReason: approvalInfo[3],
        certifiedBy: approvalInfo[4],
        certifiedByName: approvalInfo[5],
        certifiedAt: Number(approvalInfo[6]),
        certificationHash: approvalInfo[7]
      });
    }

    res.json({
      success: true,
      batches: batches
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve batch
app.post('/api/batches/:id/approve', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const batchId = parseInt(req.params.id);
    const userWallet = userWallets.get(req.session.user.username);

    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not found' });
    }

    const contractWithSigner = contract.connect(userWallet.wallet);
    const tx = await contractWithSigner.approveBatch(batchId);
    const receipt = await tx.wait();
    
    // Get batch details to award tokens
    try {
      const basicInfo = await contract.getBatchBasicInfo(batchId);
      const physicalAsset = await contract.getBatchPhysicalAsset(batchId);
      
      console.log('=== Batch Approval Token Award ===');
      console.log('Batch ID:', batchId);
      console.log('Basic Info:', basicInfo);
      console.log('Physical Asset:', physicalAsset);
      
      let creatorUsername = basicInfo[2]; // createdByName
      // Strip '_wallet' suffix if present to match session username
      if (creatorUsername && creatorUsername.endsWith('_wallet')) {
        creatorUsername = creatorUsername.replace('_wallet', '');
      }
      const tokenType = physicalAsset.tokenType || physicalAsset.material || 'Yarn';
      const weight = parseInt(physicalAsset.weight) || 0;
      
      console.log('Token award details:');
      console.log('  - Creator:', creatorUsername);
      console.log('  - Token Type:', tokenType);
      console.log('  - Weight:', weight);
      
      // Award tokens to the batch creator
      if (creatorUsername && weight > 0) {
        addTokensToUser(creatorUsername, tokenType, weight);
        console.log(`✅ Awarded ${weight} ${tokenType} tokens to ${creatorUsername}`);
      } else {
        console.log(`⚠️ Cannot award tokens: creatorUsername=${creatorUsername}, weight=${weight}`);
      }
      console.log('=================================');
    } catch (tokenError) {
      console.error('Error awarding tokens:', tokenError);
      // Don't fail the approval if token award fails
    }

    res.json({
      success: true,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Approve batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject batch
app.post('/api/batches/:id/reject', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const batchId = parseInt(req.params.id);
    const { reason } = req.body;
    const userWallet = userWallets.get(req.session.user.username);

    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not found' });
    }

    const contractWithSigner = contract.connect(userWallet.wallet);
    const tx = await contractWithSigner.rejectBatch(batchId, reason || 'No reason provided');
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Reject batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Certify batch
app.post('/api/batches/:id/certify', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const batchId = parseInt(req.params.id);
    const { certificationHash } = req.body;
    const userWallet = userWallets.get(req.session.user.username);

    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not found' });
    }

    const contractWithSigner = contract.connect(userWallet.wallet);
    const tx = await contractWithSigner.certifyBatch(batchId, certificationHash || '');
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Certify batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== BATCH ENDPOINTS FOR FRONTEND ====================

// Get single batch details
app.get('/batch/:id', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    const batchId = parseInt(req.params.id);
    const batch = await contract.batches(batchId);

    if (!batch.exists) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    const approvalInfo = await contract.getBatchApprovalInfo(batchId);

    const formattedBatch = {
      id: batchId,
      physicalAsset: {
        assetId: batch.physicalAsset.assetId,
        material: batch.physicalAsset.material,
        composition: batch.physicalAsset.composition,
        weight: batch.physicalAsset.weight,
        color: batch.physicalAsset.color || '#CCCCCC',
        batchNumber: batch.physicalAsset.batchNumber,
        productionDate: batch.physicalAsset.productionDate,
        expiryDate: batch.physicalAsset.expiryDate
      },
      tracer: {
        supplier: batch.tracer.supplier,
        farmLocation: batch.tracer.farmLocation,
        country: batch.tracer.country,
        gpsCoordinates: batch.tracer.gpsCoordinates,
        certifications: batch.tracer.certifications,
        harvestDate: batch.tracer.harvestDate
      },
      validation: {
        qualityGrade: batch.validation.qualityGrade,
        moistureContent: batch.validation.moistureContent,
        contamination: batch.validation.contamination,
        inspectionDate: batch.validation.inspectionDate,
        inspector: batch.validation.inspector,
        labResults: batch.validation.labResults
      },
      compliance: {
        regulatoryStandards: batch.compliance.regulatoryStandards,
        sustainabilityCert: batch.compliance.sustainabilityCert,
        fairTradeCert: batch.compliance.fairTradeCert,
        organicCert: batch.compliance.organicCert,
        carbonFootprint: batch.compliance.carbonFootprint,
        waterUsage: batch.compliance.waterUsage
      },
      createdBy: batch.createdBy,
      createdByName: batch.createdByName,
      createdByRole: Number(batch.createdByRole),
      createdAt: Number(batch.createdAt),
      status: Number(batch.status),
      approvedBy: approvalInfo[0],
      approvedByName: approvalInfo[1],
      approvedAt: Number(approvalInfo[2]),
      rejectionReason: approvalInfo[3],
      certifiedBy: batch.certifiedBy,
      certifiedByName: batch.certifiedByName,
      certifiedAt: Number(batch.certifiedAt),
      certificationHash: batch.certificationHash || '',
      exists: batch.exists
    };

    res.json(formattedBatch);
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve batch (alternative route)
app.post('/batch/:id/approve', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const batchId = parseInt(req.params.id);
    const userWallet = userWallets.get(req.session.user.username);

    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not found' });
    }

    const contractWithSigner = contract.connect(userWallet.wallet);
    const tx = await contractWithSigner.approveBatch(batchId);
    const receipt = await tx.wait();
    
    // Get batch details to award tokens
    try {
      const basicInfo = await contract.getBatchBasicInfo(batchId);
      const physicalAsset = await contract.getBatchPhysicalAsset(batchId);
      
      console.log('=== Batch Approval Token Award (Alt Route) ===');
      console.log('Batch ID:', batchId);
      console.log('Basic Info:', basicInfo);
      console.log('Physical Asset:', physicalAsset);
      
      let creatorUsername = basicInfo[2]; // createdByName
      // Strip '_wallet' suffix if present to match session username
      if (creatorUsername && creatorUsername.endsWith('_wallet')) {
        creatorUsername = creatorUsername.replace('_wallet', '');
      }
      const tokenType = physicalAsset.tokenType || physicalAsset.material || 'Yarn';
      const weight = parseInt(physicalAsset.weight) || 0;
      
      console.log('Token award details:');
      console.log('  - Creator:', creatorUsername);
      console.log('  - Token Type:', tokenType);
      console.log('  - Weight:', weight);
      
      // Award tokens to the batch creator
      if (creatorUsername && weight > 0) {
        addTokensToUser(creatorUsername, tokenType, weight);
        console.log(`✅ Awarded ${weight} ${tokenType} tokens to ${creatorUsername}`);
      } else {
        console.log(`⚠️ Cannot award tokens: creatorUsername=${creatorUsername}, weight=${weight}`);
      }
      console.log('============================================');
    } catch (tokenError) {
      console.error('Error awarding tokens:', tokenError);
      // Don't fail the approval if token award fails
    }

    res.json({
      success: true,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Approve batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject batch (alternative route)
app.post('/batch/:id/reject', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const batchId = parseInt(req.params.id);
    const { reason } = req.body;
    const userWallet = userWallets.get(req.session.user.username);

    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not found' });
    }

    const contractWithSigner = contract.connect(userWallet.wallet);
    const tx = await contractWithSigner.rejectBatch(batchId, reason || 'No reason provided');
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Reject batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Certify batch (alternative route)
app.post('/batch/:id/certify', async (req, res) => {
  try {
    if (!blockchainReady) {
      return res.status(503).json({ error: 'Blockchain not ready' });
    }

    if (!req.session.user) {
      return res.status(401).json({ error: 'Not logged in' });
    }

    const batchId = parseInt(req.params.id);
    const { certificationHash } = req.body;
    const userWallet = userWallets.get(req.session.user.username);

    if (!userWallet) {
      return res.status(500).json({ error: 'Wallet not found' });
    }

    const contractWithSigner = contract.connect(userWallet.wallet);
    const tx = await contractWithSigner.certifyBatch(batchId, certificationHash || '');
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Certify batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== WALLET ENDPOINTS ====================

// Get wallet address
app.get('/api/wallet/address', async (req, res) => {
  try {
    if (!req.session.user) {
      console.error('Wallet address: No session user');
      return res.status(401).json({ error: 'Not logged in' });
    }

    const username = req.session.user.username;
    console.log(`Getting wallet address for user: ${username}`);
    
    const userWallet = userWallets.get(username);
    
    if (!userWallet) {
      console.log(`Wallet not found in memory for ${username}, using blockchain address from session`);
      // Fallback to blockchain address from session
      if (req.session.user.address) {
        return res.json({
          address: req.session.user.address
        });
      }
      return res.status(500).json({ error: 'Wallet not found' });
    }

    console.log(`Wallet address for ${username}: ${userWallet.address}`);
    res.json({
      address: userWallet.address
    });
  } catch (error) {
    console.error('Get wallet address error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get token balances
app.get('/api/wallet/balances', async (req, res) => {
  try {
    if (!req.session.user) {
      console.error('Token balances: No session user');
      return res.status(401).json({ error: 'Not logged in' });
    }

    const username = req.session.user.username;
    console.log(`Getting token balances for user: ${username}`);
    
    initializeTokenBalance(username);
    const balances = userTokenBalances.get(username);
    
    console.log(`Token balances for ${username}:`, balances);

    res.json({
      balances: balances
    });
  } catch (error) {
    console.error('Get token balances error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AI ENDPOINT (keep Ollama) ====================

app.post('/api/predict', async (req, res) => {
  try {
    const requestData = req.body;
    const userMessage = requestData.messages?.[0]?.content || '';

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: userMessage,
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    
    res.json({
      choices: [{
        message: {
          content: data.response
        }
      }]
    });
  } catch (error) {
    console.error('AI prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== INFO ENDPOINTS ====================

app.get('/api', (req, res) => {
  res.json({
    message: 'Aware™ Blockchain Platform API',
    version: '2.0.0',
    status: 'running',
    features: {
      blockchain: blockchainReady,
      ollamaAI: true,
      authentication: true
    },
    blockchain: {
      ready: blockchainReady,
      contractAddress: contractAddress || null
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Aware™ Platform running on http://localhost:${PORT}`);
  console.log(`🤖 Ollama AI: ${OLLAMA_URL}`);
  console.log(`⛓️  Blockchain: ${blockchainReady ? `✅ Ready at ${contractAddress}` : '⚠️ Not deployed'}`);
  
  if (!blockchainReady) {
    console.log('\nTo enable blockchain:');
    console.log('1. Terminal 1: npm run blockchain:node');
    console.log('2. Terminal 2: npm run blockchain:deploy');
    console.log('3. Restart server\n');
  }
  
  console.log(`\nOpen je browser op: http://localhost:${PORT}`);
});
