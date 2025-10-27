// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Voting} from "../contracts/Voting.sol";

contract VotingScript is Script {
    Voting public voting;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        voting = new Voting();

        vm.stopBroadcast();
    }
}
