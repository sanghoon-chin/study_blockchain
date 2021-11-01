const Students = artifacts.require("Student_Contract");

module.exports = function (deployer) {
  deployer.deploy(Students);
};
