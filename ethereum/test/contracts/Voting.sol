// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Voting {

    bytes32[] public candidateList;
    mapping(bytes32 => uint8) public votesReceived;

    constructor(bytes32[] memory cadidateNames) {
        candidateList = cadidateNames;    
    }

    function voteForCandidate(bytes32 candidate) public {
        require(validCandidate(candidate));
        votesReceived[candidate] += 1;
    }

    function totalVotesFor(bytes32 candidate) view public returns (uint8){
        return votesReceived[candidate];
    }

    // check candidate
    function validCandidate(bytes32 candidate) view public returns (bool){
        for(uint i = 0; i < candidateList.length; i++){
            if(candidateList[i] == candidate) {
                return true;
            }
        }
        return false;
    }
}