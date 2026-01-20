import hre from "hardhat";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("🚀 Deploying SupplyChain contract to Hardhat network...");

  // Get signers
  const signers = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", signers[0].address);

  // Deploy SupplyChain contract
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();

  const contractAddress = await supplyChain.getAddress();
  console.log("✅ SupplyChain deployed to:", contractAddress);

  // Save contract address and ABI to a file
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    network: "localhost",
    deployer: signers[0].address
  };

  // Save deployment info
  fs.writeFileSync(
    join(__dirname, "../deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Copy ABI to public folder for frontend
  const artifactPath = join(__dirname, "../artifacts/contracts/SupplyChain.sol/SupplyChain.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  fs.writeFileSync(
    join(__dirname, "../SupplyChain.abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("📄 Contract ABI saved to SupplyChain.abi.json");
  console.log("📄 Deployment info saved to deployment.json");
  console.log("\n🎉 Deployment complete!");
  
  // Register some test users
  console.log("\n👥 Registering test users...");
  
  const accounts = signers;
  
  // Register users with different roles (username, password, role)
  const testUsers = [
    { username: "producer1", password: "test123", role: 0, account: 1 }, // Producer
    { username: "manufacturer1", password: "test123", role: 1, account: 2 }, // Manufacturer
    { username: "distributor1", password: "test123", role: 2, account: 3 }, // Distributor
    { username: "certifier1", password: "test123", role: 3, account: 4 }, // Certifier
    { username: "admin1", password: "test123", role: 4, account: 5 }  // Admin
  ];
  
  for (const user of testUsers) {
    const tx = await supplyChain.connect(accounts[user.account]).registerUser(user.username, user.password, user.role);
    await tx.wait();
    console.log(`✅ Registered ${user.username} (role: ${user.role}) at ${accounts[user.account].address}`);
  }
  
  console.log("\n✨ All test users registered!");
  console.log("\n📋 You can now login with these accounts:");
  for (const user of testUsers) {
    console.log(`   Username: ${user.username} | Password: ${user.password} | Address: ${accounts[user.account].address}`);
  }
  
  // Create sample batches
  console.log("\n📦 Creating sample batches...");
  
  // Batch 1: Organic Cotton (created by producer1)
  const batch1 = {
    physicalAsset: {
      assetId: "COTTON-2024-001",
      material: "Organic Cotton",
      composition: "100% Organic Cotton Fibers, Color: Natural",
      weight: "500",
      color: "#F5F5DC",
      batchNumber: "OC-2024-001",
      productionDate: "2024-01-15",
      expiryDate: "2026-01-15"
    },
    tracer: {
      supplier: "Green Fields Organic Farm",
      farmLocation: "Punjab Region",
      country: "India",
      gpsCoordinates: "30.7333° N, 76.7794° E",
      certifications: "GOTS Certified, Fair Trade",
      harvestDate: "2024-01-10"
    },
    validation: {
      qualityGrade: "Premium A",
      moistureContent: "7.5%",
      contamination: "None Detected",
      inspectionDate: "2024-01-12",
      inspector: "Dr. Priya Sharma",
      labResults: "Pesticide-free, Heavy metals within limits"
    },
    compliance: {
      regulatoryStandards: "EU Organic Regulation 2018/848",
      sustainabilityCert: "GOTS, Organic Content Standard",
      fairTradeCert: "Fair Trade USA Certified",
      organicCert: "USDA Organic, EU Organic",
      carbonFootprint: "2.1 kg CO2e per kg",
      waterUsage: "1800 liters per kg"
    }
  };
  
  const tx1 = await supplyChain.connect(accounts[1]).createBatch(
    batch1.physicalAsset,
    batch1.tracer,
    batch1.validation,
    batch1.compliance
  );
  await tx1.wait();
  console.log("✅ Batch 1 created: Organic Cotton (COTTON-2024-001)");
  
  // Batch 2: Merino Wool (created by producer1)
  const batch2 = {
    physicalAsset: {
      assetId: "WOOL-2024-002",
      material: "Merino Wool",
      composition: "100% Fine Merino Wool, Color: White",
      weight: "300",
      color: "#FFFFFF",
      batchNumber: "MW-2024-002",
      productionDate: "2024-02-20",
      expiryDate: "2029-02-20"
    },
    tracer: {
      supplier: "Mountain Meadows Ranch",
      farmLocation: "Southern Alps",
      country: "New Zealand",
      gpsCoordinates: "44.0000° S, 170.0000° E",
      certifications: "ZQ Merino Standard, RWS Certified",
      harvestDate: "2024-02-15"
    },
    validation: {
      qualityGrade: "Superfine 17.5 micron",
      moistureContent: "12%",
      contamination: "Clean, No vegetable matter",
      inspectionDate: "2024-02-18",
      inspector: "John McKenzie",
      labResults: "Fiber diameter 17.5μm, Strength 35 N/ktex"
    },
    compliance: {
      regulatoryStandards: "Responsible Wool Standard (RWS)",
      sustainabilityCert: "ZQ Merino, Responsible Wool Standard",
      fairTradeCert: "Not Applicable",
      organicCert: "Not Applicable",
      carbonFootprint: "15.2 kg CO2e per kg",
      waterUsage: "125 liters per kg"
    }
  };
  
  const tx2 = await supplyChain.connect(accounts[1]).createBatch(
    batch2.physicalAsset,
    batch2.tracer,
    batch2.validation,
    batch2.compliance
  );
  await tx2.wait();
  console.log("✅ Batch 2 created: Merino Wool (WOOL-2024-002)");
  
  // Batch 3: Organic Silk (created by producer1)
  const batch3 = {
    physicalAsset: {
      assetId: "SILK-2024-003",
      material: "Organic Silk",
      composition: "100% Organic Silk, Color: Light Blue",
      weight: "250",
      color: "#ADD8E6",
      batchNumber: "OS-2024-003",
      productionDate: "2024-03-10",
      expiryDate: "2027-03-10"
    },
    tracer: {
      supplier: "Sustainable Silk Co.",
      farmLocation: "Suzhou Region",
      country: "China",
      gpsCoordinates: "31.2989° N, 120.5853° E",
      certifications: "GOTS Certified, Organic",
      harvestDate: "2024-03-05"
    },
    validation: {
      qualityGrade: "Premium Grade A",
      moistureContent: "11%",
      contamination: "None",
      inspectionDate: "2024-03-08",
      inspector: "Li Wei",
      labResults: "Excellent quality, no defects"
    },
    compliance: {
      regulatoryStandards: "GOTS, Organic Content Standard",
      sustainabilityCert: "GOTS Certified",
      fairTradeCert: "Fair Trade Certified",
      organicCert: "Organic",
      carbonFootprint: "3.5 kg CO2e per kg",
      waterUsage: "2500 liters per kg"
    }
  };
  
  const tx3 = await supplyChain.connect(accounts[1]).createBatch(
    batch3.physicalAsset,
    batch3.tracer,
    batch3.validation,
    batch3.compliance
  );
  await tx3.wait();
  console.log("✅ Batch 3 created: Organic Silk (SILK-2024-003)");
  
  console.log("\n✨ Sample batches created on blockchain!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
