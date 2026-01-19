// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SupplyChain
 * @dev Complete supply chain management with full batch data storage
 */
contract SupplyChain {
    
    // Roles
    enum Role { Producer, Manufacturer, Distributor, Certifier, Admin }
    
    // Batch status
    enum Status { Pending, Approved, Rejected, Certified }
    
    // Physical Asset data
    struct PhysicalAsset {
        string assetId;
        string material;
        string composition;
        string weight;
        string batchNumber;
        string productionDate;
        string expiryDate;
    }
    
    // Tracer data
    struct Tracer {
        string supplier;
        string farmLocation;
        string country;
        string gpsCoordinates;
        string certifications;
        string harvestDate;
    }
    
    // Validation data
    struct Validation {
        string qualityGrade;
        string moistureContent;
        string contamination;
        string inspectionDate;
        string inspector;
        string labResults;
    }
    
    // Compliance data
    struct Compliance {
        string regulatoryStandards;
        string sustainabilityCert;
        string fairTradeCert;
        string organicCert;
        string carbonFootprint;
        string waterUsage;
    }
    
    // Complete Batch structure
    struct Batch {
        uint256 id;
        PhysicalAsset physicalAsset;
        Tracer tracer;
        Validation validation;
        Compliance compliance;
        address createdBy;
        string createdByName;
        Role createdByRole;
        uint256 createdAt;
        Status status;
        address approvedBy;
        string approvedByName;
        uint256 approvedAt;
        string rejectionReason;
        address certifiedBy;
        string certifiedByName;
        uint256 certifiedAt;
        string certificationHash;
        bool exists;
    }
    
    // User structure
    struct User {
        string username;
        string password; // In production, use hashed passwords!
        Role role;
        bool exists;
    }
    
    // State variables
    mapping(address => User) public users;
    mapping(string => address) public usernameToAddress; // For login
    mapping(uint256 => Batch) public batches;
    uint256 public batchCounter;
    uint256[] public batchIds;
    
    // Events
    event UserRegistered(address indexed userAddress, string username, Role role);
    event BatchCreated(uint256 indexed batchId, string assetId, address indexed creator);
    event BatchApproved(uint256 indexed batchId, address indexed approver);
    event BatchRejected(uint256 indexed batchId, address indexed rejector, string reason);
    event BatchCertified(uint256 indexed batchId, address indexed certifier, string certificationHash);
    
    // Modifiers
    modifier userExists() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }
    
    modifier onlyCertifier() {
        require(users[msg.sender].exists, "User not registered");
        require(users[msg.sender].role == Role.Certifier, "Only certifier can perform this action");
        _;
    }
    
    modifier batchExists(uint256 _batchId) {
        require(batches[_batchId].exists, "Batch does not exist");
        _;
    }
    
    /**
     * @dev Register a new user with role and password
     */
    function registerUser(string memory _username, string memory _password, Role _role) external {
        require(!users[msg.sender].exists, "User already registered");
        require(usernameToAddress[_username] == address(0), "Username already taken");
        
        users[msg.sender] = User({
            username: _username,
            password: _password, // In production: hash this!
            role: _role,
            exists: true
        });
        
        usernameToAddress[_username] = msg.sender;
        
        emit UserRegistered(msg.sender, _username, _role);
    }
    
    /**
     * @dev Verify login credentials
     */
    function verifyLogin(string memory _username, string memory _password) external view returns (bool, address, string memory, uint8) {
        address userAddr = usernameToAddress[_username];
        if (userAddr == address(0)) {
            return (false, address(0), "", 0);
        }
        
        User memory user = users[userAddr];
        if (keccak256(bytes(user.password)) == keccak256(bytes(_password))) {
            return (true, userAddr, user.username, uint8(user.role));
        }
        
        return (false, address(0), "", 0);
    }
    
    /**
     * @dev Create a new batch with complete data
     */
    function createBatch(
        PhysicalAsset memory _physicalAsset,
        Tracer memory _tracer,
        Validation memory _validation,
        Compliance memory _compliance
    ) external userExists returns (uint256) {
        batchCounter++;
        uint256 newBatchId = batchCounter;
        
        User memory creator = users[msg.sender];
        
        batches[newBatchId] = Batch({
            id: newBatchId,
            physicalAsset: _physicalAsset,
            tracer: _tracer,
            validation: _validation,
            compliance: _compliance,
            createdBy: msg.sender,
            createdByName: creator.username,
            createdByRole: creator.role,
            createdAt: block.timestamp,
            status: Status.Pending,
            approvedBy: address(0),
            approvedByName: "",
            approvedAt: 0,
            rejectionReason: "",
            certifiedBy: address(0),
            certifiedByName: "",
            certifiedAt: 0,
            certificationHash: "",
            exists: true
        });
        
        batchIds.push(newBatchId);
        
        emit BatchCreated(newBatchId, _physicalAsset.assetId, msg.sender);
        
        return newBatchId;
    }
    
    /**
     * @dev Approve a batch
     */
    function approveBatch(uint256 _batchId) external userExists batchExists(_batchId) {
        require(batches[_batchId].status == Status.Pending, "Batch is not pending");
        
        batches[_batchId].status = Status.Approved;
        batches[_batchId].approvedBy = msg.sender;
        batches[_batchId].approvedByName = users[msg.sender].username;
        batches[_batchId].approvedAt = block.timestamp;
        
        emit BatchApproved(_batchId, msg.sender);
    }
    
    /**
     * @dev Reject a batch with reason
     */
    function rejectBatch(uint256 _batchId, string memory _reason) external userExists batchExists(_batchId) {
        require(batches[_batchId].status == Status.Pending, "Batch is not pending");
        
        batches[_batchId].status = Status.Rejected;
        batches[_batchId].rejectionReason = _reason;
        
        emit BatchRejected(_batchId, msg.sender, _reason);
    }
    
    /**
     * @dev Certify an approved batch
     */
    function certifyBatch(uint256 _batchId, string memory _certificationHash) external onlyCertifier batchExists(_batchId) {
        require(batches[_batchId].status == Status.Approved, "Batch must be approved first");
        
        batches[_batchId].status = Status.Certified;
        batches[_batchId].certifiedBy = msg.sender;
        batches[_batchId].certifiedByName = users[msg.sender].username;
        batches[_batchId].certifiedAt = block.timestamp;
        batches[_batchId].certificationHash = _certificationHash;
        
        emit BatchCertified(_batchId, msg.sender, _certificationHash);
    }
    
    /**
     * @dev Get batch count
     */
    function getBatchCount() external view returns (uint256) {
        return batchIds.length;
    }
    
    /**
     * @dev Get all batch IDs
     */
    function getAllBatchIds() external view returns (uint256[] memory) {
        return batchIds;
    }
    
    /**
     * @dev Get batch by ID (split into multiple functions due to struct size)
     */
    function getBatchBasicInfo(uint256 _batchId) external view batchExists(_batchId) returns (
        uint256 id,
        address createdBy,
        string memory createdByName,
        uint8 createdByRole,
        uint256 createdAt,
        uint8 status
    ) {
        Batch memory batch = batches[_batchId];
        return (
            batch.id,
            batch.createdBy,
            batch.createdByName,
            uint8(batch.createdByRole),
            batch.createdAt,
            uint8(batch.status)
        );
    }
    
    function getBatchPhysicalAsset(uint256 _batchId) external view batchExists(_batchId) returns (PhysicalAsset memory) {
        return batches[_batchId].physicalAsset;
    }
    
    function getBatchTracer(uint256 _batchId) external view batchExists(_batchId) returns (Tracer memory) {
        return batches[_batchId].tracer;
    }
    
    function getBatchValidation(uint256 _batchId) external view batchExists(_batchId) returns (Validation memory) {
        return batches[_batchId].validation;
    }
    
    function getBatchCompliance(uint256 _batchId) external view batchExists(_batchId) returns (Compliance memory) {
        return batches[_batchId].compliance;
    }
    
    function getBatchApprovalInfo(uint256 _batchId) external view batchExists(_batchId) returns (
        address approvedBy,
        string memory approvedByName,
        uint256 approvedAt,
        string memory rejectionReason,
        address certifiedBy,
        string memory certifiedByName,
        uint256 certifiedAt,
        string memory certificationHash
    ) {
        Batch memory batch = batches[_batchId];
        return (
            batch.approvedBy,
            batch.approvedByName,
            batch.approvedAt,
            batch.rejectionReason,
            batch.certifiedBy,
            batch.certifiedByName,
            batch.certifiedAt,
            batch.certificationHash
        );
    }
}
