const checkOwned = require('./custom/owned')
const et = require('./helpers/error_tests')
const address = require('./helpers/address')
const list = require('./helpers/list')
const { PlayerInfo, PlayerMoveReason, GameStatus } = require('./helpers/game')


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
		let struct = await gameBase.infoPlayers(address.ADDRESS)
		struct = PlayerInfo(struct)
		const emptyStruct = new PlayerInfo(false, address.ADDRESS, 0, 0, 0, 0)
		assert(struct.equal(emptyStruct), 'Пустая структура необходимого формата')
	});

	it('Добавление игроков', async () => {
		const gameBase = await GameBase.deployed();

	})

	it('Удаление игроков', async () => {
		const gameBase = await GameBase.deployed();

	})

	it('Проверка ходов', async () => {
		const gameBase = await GameBase.deployed();

	})

	it('Проверка завершения игры', async () => {
		const gameBase = await GameBase.deployed();

	})
	
	it('Проверка доступности по статусу игры', async () => {
		const gameBase = await GameBase.deployed();
		await gameBase.setStatusGame(GameStatus('Started'))
		await et(false, ()=>gameBase.outerStepTest(), '[ outerStep ] Недоступен до старта игры');
	});
})
