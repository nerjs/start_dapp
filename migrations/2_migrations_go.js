// var Test = artifacts.require("Test.sol");
var Owned = artifacts.require("Owned");
var SharedOwner = artifacts.require("SharedOwner");
module.exports = function(deployer) {
  deployer.deploy(Owned);
  deployer.deploy(SharedOwner);
};
