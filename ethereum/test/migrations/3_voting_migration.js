const Voting = artifacts.require("Student_Contract");
const web3 = require('web3')

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Voting, ['Alice', 'Bob', 'Charlie'].map(name => web3.utils.asciiToHex(name)));
};
