const checkOwned = require('./custom/owned')

const CheckGas = require('./helpers/gas')

const SharedOwnedTest = artifacts.require('SharedOwnedTest')
const SharedOwned = artifacts.require('SharedOwned')
const OwnedTest = artifacts.require('OwnedTest')
const Owned = artifacts.require('Owned')


contract('Owned', accounts => {
	const checkGas = new CheckGas();
	checkGas.start('OwnedTest',OwnedTest)
	checkGas.start('Owned',Owned)

	checkOwned(OwnedTest, accounts, false, checkGas);

	checkGas.it()
})

contract('SaredOwned', accounts => {
	const checkGas = new CheckGas();
	checkGas.start('SharedOwnedTest',SharedOwnedTest)
	checkGas.start('SharedOwned',SharedOwned)
	checkOwned(SharedOwnedTest, accounts, true, checkGas);
	checkGas.it()
})


