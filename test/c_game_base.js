const checkOwned = require('./custom/owned')
const et = require('../utils/error_tests')
const address = require('./helpers/address')
const list = require('./helpers/list')
const { PlayerInfo } = require('./helpers/game')


const GameBase = artifacts.require('GameBaseTest')

contract('GameBase', accounts => {
	it('Стартовые данные', async () => {
		const gameBase = await GameBase.deployed();
		await list.startData(gameBase, [
			{ n: 'timeOut', r: 0 },
			{ name: 'confirmTimeOut', result: 0 },
			{ n: 'endpointTime', r: 0},
			{ n: 'maxPlayers', r: 0},
			{ n: 'allSteps', r: 0},
			{ n: 'timeStartGame', r: 0},
			{ n: 'timeEndGame', r: 0},
			{ n: 'statusGame', r: 0},
			{ n: 'host', r: address.ADDRESS},
			{ n: 'winner', r: address.ADDRESS},
			{ n: 'nextStepPlayer', r: address.ADDRESS},
			{ n: 'prevStepPlayer', r: address.ADDRESS},
		])
	});
	
	it('Проверка доступности по статусу игры', async () => {
		const gameBase = await GameBase.deployed();
		const struct = await gameBase.infoPlayers(address.ADDRESS)
		console.log(PlayerInfo(struct))
		console.log(PlayerInfo(struct).toArray())
		console.log(PlayerInfo(struct).toJSON())
		const arr = PlayerInfo(struct).toArray();
		console.log(PlayerInfo(struct).equal(PlayerInfo(arr)))
		arr[2] = 1
		console.log(PlayerInfo(struct).equal(PlayerInfo(arr)))
		
	});
})
