// var Test = artifacts.require("Test.sol");
const OwnedTest = artifacts.require("OwnedTest");
const SharedOwnerTest = artifacts.require("SharedOwnedTest");
const AddrArrLibTest = artifacts.require('AddrArrLibTest');
const AddrArr = artifacts.require('AddrArr')
const GameBaseTest = artifacts.require('GameBaseTest');

module.exports = (deployer, network, accounts) => {

	if (process.env.NODE_ENV === 'test' && network === 'development') {
		deployer.deploy(AddrArr);
		deployer.link(AddrArr, AddrArrLibTest);
		deployer.link(AddrArr, GameBaseTest);

		deployer.deploy(OwnedTest)
		deployer.deploy(SharedOwnerTest)
		deployer.deploy(AddrArrLibTest, accounts)
		deployer.deploy(GameBaseTest)
		
		
	}


};
