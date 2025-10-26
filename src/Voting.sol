// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// Index of the candidate in the array
type CandidateId is uint256;

contract Voting {
    address owner;

    Candidate[] public candidates;
    mapping(CandidateId => uint256) public votes;
    mapping(address => uint256) userVotes;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Only contract owner can add new candidates");
        _;
    }

    // TODO:
    //   - we shoould have a voting period, any calls to the vote endpoint should be invalid
    modifier votingoFinished() {
        require(candidates.length > 0, "No candidates added yet.");
        _;
    }

    function addCandidate(Candidate memory newCandidate) public onlyOwner {
        candidates.push(newCandidate);
    }

    // Vote for a candidate
    // TODO: we might need a whitelist of users or some means of unincentivising users
    //   from creating new accounts to gain more votes
    function vote(CandidateId candidateIndex) public {
        require(userVotes[msg.sender] == 0, "A user can only vote once");

        userVotes[msg.sender] = 1;
        votes[candidateIndex] += 1;
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    // This function will return the first candidate with the highest vote count
    // TODO:
    //   - handle ties
    function getWinner() public view votingoFinished returns (Candidate memory winner) {
        uint256 voteCount = 0;

        for (uint256 i = 1; i < candidates.length; i++) {
            CandidateId candidateId = CandidateId.wrap(i);
            if (votes[candidateId] > voteCount) {
                voteCount = votes[candidateId];
                winner = candidates[i];
            }
        }
        return winner;
    }
}

struct Candidate {
    // Name of the candidate
    string name;
    // Any other data that has to be stored on the chain
    string metadata;
}
