const API_URL = 'http://localhost:3000';

// Login en krijg sessie cookie
async function login(username, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const cookies = response.headers.get('set-cookie');
    const data = await response.json();
    
    if (!data.success) {
        throw new Error('Login failed: ' + data.message);
    }
    
    console.log(`✅ Logged in as ${username}`);
    return cookies;
}

// Maak een batch aan
async function createBatch(cookie, batchData) {
    const response = await fetch(`${API_URL}/api/batches/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify(batchData)
    });
    
    const text = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', text);
    
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error('Invalid JSON response: ' + text);
    }
    
    if (!data.success) {
        throw new Error('Batch creation failed: ' + (data.message || data.error || text));
    }
    
    console.log(`✅ Batch created with ID: ${data.batchId}`);
    return data.batchId;
}

// Sample batch data
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

const batch2 = {
    physicalAsset: {
        assetId: "WOOL-2024-002",
        material: "Merino Wool",
        composition: "100% Fine Merino Wool, Color: N/A",
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

async function main() {
    try {
        console.log('🚀 Creating sample batches on blockchain...\n');
        
        // Login als producer
        const cookie = await login('producer1', 'test123');
        
        // Maak batches aan
        console.log('\n📦 Creating batch 1: Organic Cotton...');
        await createBatch(cookie, batch1);
        
        console.log('\n📦 Creating batch 2: Merino Wool...');
        await createBatch(cookie, batch2);
        
        console.log('\n📦 Creating batch 3: Organic Silk (Light Blue)...');
        await createBatch(cookie, batch3);
        
        console.log('\n✨ Sample batches successfully created on blockchain!');
        console.log('🌐 View them at: http://localhost:3000');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

main();
