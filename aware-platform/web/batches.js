// Batch data now comes from blockchain
// This file provides utility functions for batch display and filtering

// Status enum mapping (matches smart contract)
const STATUS = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    CERTIFIED: 3
};

const STATUS_LABELS = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected',
    3: 'Certified'
};

const STATUS_COLORS = {
    0: '#FFA500', // Orange
    1: '#4CAF50', // Green
    2: '#F44336', // Red
    3: '#2196F3'  // Blue
};

// Role enum mapping (matches smart contract)
const ROLE = {
    PRODUCER: 0,
    MANUFACTURER: 1,
    DISTRIBUTOR: 2,
    CERTIFIER: 3,
    ADMIN: 4
};

const ROLE_LABELS = {
    0: 'Producer',
    1: 'Manufacturer',
    2: 'Distributor',
    3: 'Certifier',
    4: 'Admin'
};

// Fetch all batches from blockchain
async function fetchBatches() {
    try {
        const response = await fetch('/api/batches');
        const data = await response.json();
        
        if (data.success) {
            return data.batches;
        } else {
            console.error('Error fetching batches:', data.error);
            return [];
        }
    } catch (error) {
        console.error('Network error:', error);
        return [];
    }
}

// Format date from timestamp
function formatDate(timestamp) {
    if (!timestamp || timestamp === 0) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('nl-NL');
}

// Format datetime from timestamp
function formatDateTime(timestamp) {
    if (!timestamp || timestamp === 0) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('nl-NL');
}

// Get status badge HTML
function getStatusBadge(status) {
    const label = STATUS_LABELS[status] || 'Unknown';
    const color = STATUS_COLORS[status] || '#999';
    
    return `<span class="badge" style="background: ${color}; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
        ${label}
    </span>`;
}

// Filter batches by search term
function filterBatchesBySearch(batches, searchTerm) {
    if (!searchTerm) return batches;
    
    const term = searchTerm.toLowerCase();
    return batches.filter(batch => {
        return (
            batch.physicalAsset.assetId?.toLowerCase().includes(term) ||
            batch.physicalAsset.material?.toLowerCase().includes(term) ||
            batch.physicalAsset.batchNumber?.toLowerCase().includes(term) ||
            batch.tracer.supplier?.toLowerCase().includes(term) ||
            batch.tracer.country?.toLowerCase().includes(term)
        );
    });
}

// Filter batches by status
function filterBatchesByStatus(batches, status) {
    if (status === '' || status === undefined) return batches;
    
    return batches.filter(batch => batch.status === parseInt(status));
}

// Sort batches
function sortBatches(batches, sortBy) {
    const sorted = [...batches];
    
    switch(sortBy) {
        case 'newest':
            sorted.sort((a, b) => b.createdAt - a.createdAt);
            break;
        case 'oldest':
            sorted.sort((a, b) => a.createdAt - b.createdAt);
            break;
        case 'status':
            sorted.sort((a, b) => a.status - b.status);
            break;
        case 'assetId':
            sorted.sort((a, b) => a.physicalAsset.assetId.localeCompare(b.physicalAsset.assetId));
            break;
        default:
            // Keep original order
            break;
    }
    
    return sorted;
}

// Global function to load batches from blockchain
async function loadBatchesGlobally() {
    try {
        const batches = await fetchBatches();
        return batches;
    } catch (error) {
        console.error('Error loading batches globally:', error);
        return [];
    }
}

// Render batch table with standardized columns: Date, Type, Color, Asset ID, Weight Kgs, Status, Action
function renderBatchTable(batches, tableBodyId, onActionClick) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) {
        console.error('Table body not found:', tableBodyId);
        return;
    }

    tbody.innerHTML = '';

    if (!batches || batches.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--muted);">
                    No batches found
                </td>
            </tr>
        `;
        return;
    }

    batches.forEach((batch) => {
        const row = document.createElement('tr');
        
        // Extract color from composition or material
        const colorText = batch.physicalAsset.composition?.match(/color[:\s]+([^,\n]+)/i)?.[1] || 
                         batch.physicalAsset.material?.match(/color[:\s]+([^,\n]+)/i)?.[1] || 
                         'N/A';
        
        // Get hex color if available
        const colorHex = batch.physicalAsset.color || '#CCCCCC';
        
        // Extract type from material
        const type = batch.physicalAsset.material || 'N/A';
        
        row.innerHTML = `
            <td>${formatDate(batch.createdAt)}</td>
            <td>${type}</td>
            <td>
                <span class="color-box" style="background-color: ${colorHex};"></span>
                ${colorText}
            </td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${batch.physicalAsset.assetId}">
                ${batch.physicalAsset.assetId || 'N/A'}
            </td>
            <td>${batch.physicalAsset.weight || 'N/A'}</td>
            <td>${getStatusBadge(batch.status)}</td>
            <td>
                <button class="select-btn" onclick="${onActionClick}(${batch.id})">Select</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}
