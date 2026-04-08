pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EventTicket
 * @dev ERC-721 NFT contract for event tickets on EventChain
 * Each event deploys its own instance of this contract
 */
contract EventTicket is ERC721, ERC721URIStorage, ReentrancyGuard {
    address public organizer;
    string public eventId;
    string public baseTokenURI;
    
    uint256[] public tierPrices; 
    uint256[] public tierSupply; 
    uint256[] public tierMinted;
    
    mapping(uint256 => uint256) public ticketTier;
    
    uint256 public totalMinted;
    event TicketMinted(address indexed buyer, uint256 indexed tokenId, uint256 indexed tierId);
    event FundsWithdrawn(address indexed organizer, uint256 amount);
    
    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only organizer can call this");
        _;
    }
    
    /**
     * @param _eventId Backend UUID for this event
     * @param _name NFT collection name (e.g., "Concert 2026 Tickets")
     * @param _symbol NFT symbol (e.g., "C2026")
     * @param _tierPrices Array of prices for each tier in wei
     * @param _tierSupply Array of max supply for each tier
     * @param _baseURI Base URI for token metadata
     */
    constructor(
        string memory _eventId,
        string memory _name,
        string memory _symbol,
        uint256[] memory _tierPrices,
        uint256[] memory _tierSupply,
        string memory _baseURI
    ) ERC721(_name, _symbol) {
        require(_tierPrices.length == _tierSupply.length, "Tier arrays must match length");
        require(_tierPrices.length > 0, "Must have at least one tier");
        
        organizer = msg.sender;
        eventId = _eventId;
        baseTokenURI = _baseURI;

        for (uint256 i = 0; i < _tierPrices.length; i++) {
            tierPrices.push(_tierPrices[i]);
            tierSupply.push(_tierSupply[i]);
            tierMinted.push(0);
        }
    }
    
    
    /**
     * @dev Mint a ticket for a specific tier
     * @param tierId The tier index (0-based)
     */
    function mintTicket(uint256 tierId) external payable nonReentrant {
        require(tierId < tierPrices.length, "Invalid tier");
        require(tierMinted[tierId] < tierSupply[tierId], "Tier sold out");
        require(msg.value >= tierPrices[tierId], "Insufficient payment");

        totalMinted++;
        tierMinted[tierId]++;
        
        uint256 tokenId = totalMinted;

        ticketTier[tokenId] = tierId;
        
        _safeMint(msg.sender, tokenId);
        
        if (msg.value > tierPrices[tierId]) {
            uint256 refund = msg.value - tierPrices[tierId];
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
        
        emit TicketMinted(msg.sender, tokenId, tierId);
    }
    
    /**
     * @dev Get tier information
     * @param tierId The tier index
     * @return price Price in wei
     * @return supply Total supply for this tier
     * @return minted Number of tickets minted for this tier
     */
    function getTierInfo(uint256 tierId) external view returns (
        uint256 price,
        uint256 supply,
        uint256 minted
    ) {
        require(tierId < tierPrices.length, "Invalid tier");
        return (tierPrices[tierId], tierSupply[tierId], tierMinted[tierId]);
    }
    
    /**
     * @dev Get the tier for a specific token
     * @param tokenId The token ID
     * @return tierId The tier index
     */
    function getTicketTier(uint256 tokenId) external view returns (uint256) {
        require(tokenId > 0 && tokenId <= totalMinted, "Token does not exist");
        return ticketTier[tokenId];
    }
    
    /**
     * @dev Get number of tiers
     */
    function getTierCount() external view returns (uint256) {
        return tierPrices.length;
    }
    
    /**
     * @dev Withdraw contract balance to organizer
     */
    function withdraw() external onlyOrganizer nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(organizer).call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(organizer, balance);
    }
    
    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
}
