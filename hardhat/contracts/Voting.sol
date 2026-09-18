// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    address public owner;
    
    uint256 public candidateFee;

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;

    mapping(address => bool) public hasVoted;
    mapping(bytes32 => bool) public candidateExists;
    mapping(bytes32 => uint256) private candidateIndex;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can use this function");
        _;
    }

    constructor(uint256 _feeInWei) {
        owner = msg.sender;
        candidateFee = _feeInWei;
    }

    // Додавання кандидата
    function addCandidate(string memory name) public payable {
        require(msg.value >= candidateFee, "Insufficient funds to add a candidate");
        
        bytes32 nameHash = keccak256(abi.encodePacked(name));
        require(!candidateExists[nameHash], "This candidate already exist");

        candidateExists[nameHash] = true;
        candidates.push(Candidate({
            name: name,
            voteCount: 0
        }));
        
        candidateIndex[nameHash] = candidates.length - 1;
    }

    // Голосування
    function vote(string memory candidateName) public {
        require(!hasVoted[msg.sender], "You've already voted");
        
        bytes32 nameHash = keccak256(abi.encodePacked(candidateName));
        require(candidateExists[nameHash], "No candidate with such name found");

        hasVoted[msg.sender] = true;
        
        uint256 index = candidateIndex[nameHash];
        candidates[index].voteCount++;
    }

    // Визначення переможця
    function getWinner() public view onlyOwner returns (string memory winnerName) {
        require(candidates.length > 0, "There's no candidate");

        uint256 winningVoteCount = 0;
        uint256 winnerIndex = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = candidates[i].voteCount;
                winnerIndex = i;
            }
        }

        return candidates[winnerIndex].name;
    }

    // Функція для отримання всього списку кандидатів
    function getAllCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }
}