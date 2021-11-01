const Token = artifacts.require("Token");

module.exports = function(deployer) {
  deployer.deploy(Token, 'jsaon token', 'JT', 12, 100000000000);
};
