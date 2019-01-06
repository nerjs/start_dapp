// var Test = artifacts.require("Test.sol");
const OwnedTest = artifacts.require("OwnedTest");
const SharedOwnerTest = artifacts.require("SharedOwnedTest");
const AddrArrLibTest = artifacts.require('AddrArrLibTest');
const AddrArrLibTestEmpty = artifacts.require('AddrArrLibTestEmpty');
const AddrArr = artifacts.require('AddrArr')
const GameBaseTest = artifacts.require('GameBaseTest');
const GameBase = artifacts.require('GameBase');
const Proxy = artifacts.require('Proxy');

module.exports = (deployer, network, accounts) => {

	if (process.env.NODE_ENV === 'test' && network === 'development') {
		deployer.deploy(AddrArr);
		deployer.link(AddrArr, AddrArrLibTest);
		deployer.link(AddrArr, AddrArrLibTestEmpty);
		deployer.link(AddrArr, GameBaseTest);
		deployer.link(AddrArr, GameBase);

		deployer.deploy(OwnedTest)
		deployer.deploy(SharedOwnerTest)
		deployer.deploy(AddrArrLibTest, accounts)
		deployer.deploy(GameBaseTest)
		
		
	}

	deployer.deploy(AddrArr);
	deployer.link(AddrArr, GameBaseTest);
	deployer.deploy(GameBaseTest).then(gb => {
		return deployer.deploy(Proxy, gb.address)
	})
	


};
