const Voting = artifacts.require("Student_Contract");
const web3 = require('web3')

module.exports = function (deployer, network, accounts) {
    console.log(deployer)
    console.log(network)
    console.log(accounts)
    deployer.deploy(Voting);
};
