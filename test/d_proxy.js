const et = require('./helpers/error_tests')
const address = require('./helpers/address')
const list = require('./helpers/list')
const checkEvents = require('./helpers/check_events')
const { sleep, TimePoint, toSec, equalTime } = require('./helpers/time')
const { PlayerInfo, PlayerStatus, PlayerMoveReason, GameStatus } = require('./helpers/game')
const CheckGas = require('./helpers/gas')


const GameBase = artifacts.require('GameBaseTest')
const Proxy = artifacts.require('Proxy3')
const ProxyDeployer = artifacts.require('ProxyDeployer')
const IGameBase = artifacts.require('IGameBase')


contract('Proxy', accounts => {
	const checkGas = new CheckGas();

	it('Деплой', async () => {
		// const gameBase = await GameBase.new();
		// const proxy = await Proxy.new(gameBase.address);
		// checkGas.contract('GameBaseTest', gameBase)
		// checkGas.contract('Proxy', proxy)

		// await et(false, () => Proxy.new(address.ADDRESS), 'Нельзя создать прокси с пустым адресом')
		// await et(true, () => Proxy.new(gameBase.address), 'Можно создать прокси с непустым адресом')

		// const targetContract = await proxy.targetContract();
		
		// assert.equal(targetContract, gameBase.address, 'Адрес контракта соответствует');
		
	});

	it('Работоспособность', async () => {
		const gameBase = await GameBase.new();
		const pd = await ProxyDeployer.new(gameBase.address);
		await pd.dep()
		const proxyAddr = await pd.lastProxy();
		const _proxy = await Proxy.new(proxyAddr);
		const proxy = await IGameBase.at(_proxy.address)
		checkGas.contract('GameBaseTest', gameBase)
		checkGas.contract('Proxy', _proxy)
	

		let tx, results;

		// results = await list.startData(proxy, [
		// 	{ n: 'timeOut', r: 0 },
		// 	{ name: 'confirmTimeOut', result: 0 },
		// 	{ n: 'endpointTime', r: 0},
		// 	{ n: 'maxPlayers', r: 0},
		// 	{ n: 'allSteps', r: 0},
		// 	{ n: 'timeStartGame', r: 0},
		// 	{ n: 'timeEndGame', r: 0},
		// 	{ n: 'statusGame', r: 0},
		// 	{ n: 'host', r: address.ADDRESS},
		// 	{ n: 'winner', r: address.ADDRESS},
		// 	{ n: 'nextStepPlayer', r: address.ADDRESS},
		// 	{ n: 'prevStepPlayer', r: address.ADDRESS}
		// ])


		results = await proxy.timeOut();
		console.log('timeOut [1]',results, results.toNumber())
		results = await proxy.confirmTimeOut();
		console.log('confirmTimeOut [1]', results, results.toNumber())
		results = await proxy.maxPlayers();
		console.log('maxPlayers [1]',results, results.toNumber())

		tx = await proxy.setInfoDataTest(11,15,2);
		// checkGas.save('setInfoData', tx) 
		console.log(tx)

		console.log('*********************************')
		console.log(proxy.timeOut())
		results = await proxy.timeOut();
		console.log('timeOut [2]',results, results.toNumber(), 11)
		results = await proxy.confirmTimeOut();
		console.log('confirmTimeOut [2]', results, results.toNumber(), 15)
		results = await proxy.maxPlayers();
		console.log('maxPlayers [2]',results, results.toNumber(), 2)
		
		// await list.startData(proxy, [
		// 	{ n: 'timeOut', r: 10 },
		// 	{ n: 'confirmTimeOut', r: 2 },
		// 	{ n: 'maxPlayers', r: 2}
		// ])
				
		// tx = await Promise.all([
		// 	proxy.addPlayerTest(accounts[0], PlayerMoveReason('GameCreate')),
		// 	proxy.addPlayerTest(accounts[1], PlayerMoveReason('GameCreate'))
		// ])

		// checkGas.save('addPlayer', tx[0])
		// checkGas.save('addPlayer', tx[1])


		// tx = await et(true, ()=>proxy.startGameTestEmpty(),'Можно стартовать игру без указания адреса')

		// checkGas.save('startGame', tx, 'empty')
	});

	checkGas.it('Proxy')
})