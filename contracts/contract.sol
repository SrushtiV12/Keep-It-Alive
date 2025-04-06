// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") Ownable(msg.sender) {
        _mint(address(this), initialSupply * 10 ** decimals());
    }

    // --- Game Logic: High Scores ---
    mapping(address => uint256) public highScores;

    function submitScore(uint256 score) external {
        require(score > highScores[msg.sender], "Not a high score");

        highScores[msg.sender] = score;

        uint256 rewardAmount = score * 10 ** decimals();
        require(balanceOf(address(this)) >= rewardAmount, "Not enough tokens in contract");

        _transfer(address(this), msg.sender, rewardAmount);
    }

    // --- Token Management ---
    function transferFromContract(address to, uint256 amount) external onlyOwner {
        require(balanceOf(address(this)) >= amount, "Insufficient tokens in contract");
        _transfer(address(this), to, amount);
    }

    function balanceInContract() external view returns (uint256) {
        return balanceOf(address(this));
    }

    // --- Shop: Skins & Characters ---

    struct Skin {
        uint256 id;
        string name;
        uint256 price; // in tokens
    }

    struct Character {
        uint256 id;
        string name;
        uint256 price; // in tokens
    }

    mapping(uint256 => Skin) public skins;
    mapping(uint256 => Character) public characters;

    mapping(address => uint256[]) public ownedSkins;
    mapping(address => uint256[]) public ownedCharacters;

    uint256 public nextSkinId = 1;
    uint256 public nextCharacterId = 1;

    // Owner adds a skin
    function addSkin(string memory name, uint256 price) external onlyOwner {
        skins[nextSkinId] = Skin(nextSkinId, name, price);
        nextSkinId++;
    }

    // Owner adds a character
    function addCharacter(string memory name, uint256 price) external onlyOwner {
        characters[nextCharacterId] = Character(nextCharacterId, name, price);
        nextCharacterId++;
    }

    // Buy a skin
    function buySkin(uint256 skinId) external {
        Skin memory skin = skins[skinId];
        require(skin.id != 0, "Skin does not exist");

        uint256 cost = skin.price * 10 ** decimals();
        require(balanceOf(msg.sender) >= cost, "Not enough tokens");

        _transfer(msg.sender, address(this), cost);
        ownedSkins[msg.sender].push(skinId);
    }

    // Buy a character
    function buyCharacter(uint256 characterId) external {
        Character memory character = characters[characterId];
        require(character.id != 0, "Character does not exist");

        uint256 cost = character.price * 10 ** decimals();
        require(balanceOf(msg.sender) >= cost, "Not enough tokens");

        _transfer(msg.sender, address(this), cost);
        ownedCharacters[msg.sender].push(characterId);
    }

    // View owned skins
    function getMySkins() external view returns (uint256[] memory) {
        return ownedSkins[msg.sender];
    }

    // View owned characters
    function getMyCharacters() external view returns (uint256[] memory) {
        return ownedCharacters[msg.sender];
    }
}