// var Test = artifacts.require("Test.sol");
var OwnedTest = artifacts.require("OwnedTest");
var SharedOwnerTest = artifacts.require("SharedOwnedTest");
const Game = artifacts.require('Game')

module.exports = function(deployer, network) {

	if (process.env.NODE_ENV === 'test' && network === 'development') {
		deployer.deploy(OwnedTest);
		deployer.deploy(SharedOwnerTest);
		// deployer.deploy(Game);
	}

};
