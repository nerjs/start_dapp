const checkOwned = require('./custom/owned')
const et = require('../utils/error_tests')
const address = require('./helpers/address')
const list = require('./helpers/list')


const GameBase = artifacts.require('GameBaseTest')

contract('GameBase', accounts => {
	it('Стартовые данные', async () => {
		const gameBase = await GameBase.deployed();
		await list.startData(gameBase, [
			
		])
	});
	// checkOwned(GameBase, accounts, false)
})
