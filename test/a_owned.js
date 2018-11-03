const checkOwned = require('./custom/owned')

const SharedOwnedTest = artifacts.require('SharedOwnedTest')
const OwnedTest = artifacts.require('OwnedTest')


contract('Owned', accounts => {
	checkOwned(OwnedTest, accounts, false);
})

contract('SaredOwned', accounts => {
	checkOwned(SharedOwnedTest, accounts, true);
})


