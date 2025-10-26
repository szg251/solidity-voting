// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Voting, Candidate, CandidateWithVotes, CandidateId} from "../contracts/Voting.sol";

contract VotingTest is Test {
    Voting public voting;
    address alice = address(0x000000);
    address bob = address(0x000001);
    address charlie = address(0x000002);

    Candidate candidate1 = Candidate({name: "George", metadata: "Vote for me!"});
    Candidate candidate2 = Candidate({name: "Gergely", metadata: "Vote for me instead!"});
    Candidate candidate3 = Candidate({name: "Alice", metadata: "I'm running too!"});

    function setUp() public {
        voting = new Voting();
    }

    function test_addCandidates() public {
        addCandidates();

        Candidate[] memory expected = new Candidate[](2);
        expected[0] = candidate1;
        expected[1] = candidate2;

        CandidateWithVotes[] memory got = voting.getCandidates();

        assertEq(got.length, expected.length);
        assertEq(got[0].candidate.name, expected[0].name);
        assertEq(got[1].candidate.name, expected[1].name);
    }

    function test_vote() public {
        addCandidates();
        vote();

        Candidate memory winner = voting.getWinner();

        assertEq(winner.name, "Gergely");
    }

    // Alice trying to cast 2 votes should fail
    function test_invalidVote() public {
        addCandidates();
        vote();

        vm.prank(alice);
        vm.expectRevert();
        voting.vote(CandidateId.wrap(1));
    }

    // Someone else other than the contract owner tries to add candidate
    function test_invalidAddCandidate() public {
        vm.prank(alice);
        vm.expectRevert();
        voting.addCandidate(candidate3);
    }

    function addCandidates() private {
        voting.addCandidate(candidate1);
        voting.addCandidate(candidate2);
    }

    function vote() private {
        vm.prank(alice);
        voting.vote(CandidateId.wrap(0));
        vm.prank(bob);
        voting.vote(CandidateId.wrap(1));
        vm.prank(charlie);
        voting.vote(CandidateId.wrap(1));
    }
}
