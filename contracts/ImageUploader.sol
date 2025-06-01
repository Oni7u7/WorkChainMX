// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ImageUploader {
    address public owner;
    uint256 public uploadFee; // en wei
    uint256 public totalImages;

    struct Image {
        address uploader;
        string imageURI;
        uint256 timestamp;
    }

    mapping(uint256 => Image) public images;

    event ImageUploaded(address indexed uploader, uint256 indexed imageId, string imageURI);
    event FeeUpdated(uint256 newFee);
    event FundsWithdrawn(uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede hacer esto");
        _;
    }

    constructor(uint256 _uploadFee) {
        owner = msg.sender;
        uploadFee = _uploadFee; // Por ejemplo: 0.01 DEV = 10**16
    }

    function uploadImage(string calldata _imageURI) external payable {
        require(msg.value >= uploadFee, "Pago insuficiente para subir imagen");

        images[totalImages] = Image({
            uploader: msg.sender,
            imageURI: _imageURI,
            timestamp: block.timestamp
        });

        emit ImageUploaded(msg.sender, totalImages, _imageURI);
        totalImages++;
    }

    function updateFee(uint256 _newFee) external onlyOwner {
        uploadFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay fondos para retirar");
        payable(owner).transfer(balance);
        emit FundsWithdrawn(balance);
    }

    function getImage(uint256 imageId) public view returns (Image memory) {
        return images[imageId];
    }

    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }
} 