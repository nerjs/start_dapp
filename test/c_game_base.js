const checkOwned = require('./custom/owned')
const et = require('./helpers/error_tests')
const address = require('./helpers/address')
const list = require('./helpers/list')
const checkEvents = require('./helpers/check_events')
const { sleep, TimePoint } = require('./helpers/time')
const { PlayerInfo, PlayerStatus, PlayerMoveReason, GameStatus } = require('./helpers/game')


const GameBase = artifacts.require('GameBaseTest')






contract('GameBase', accounts => { 


	const addPlayersInGame = async (gb, count) => {
		const arr = accounts.filter((a,i)=> (i < count))

		await Promise.all(arr.map(addr => gb.addPlayerTest(addr, PlayerMoveReason('GameCreate'))))

		await Promise.all(arr.map(addr => gb.confirmPlayerTest(addr)));

		return arr;
	}

	const getPlayer = async (gb, addr) => {
		const pl = await gb.infoPlayers(addr);
		return PlayerInfo(pl)
	}

	const getNextPl = async gb => {
		const next = await gb.nextStepPlayer();
		const np = await getPlayer(gb, next);
		return np;
	}
	const getPrevPl = async gb => {
		const next = await gb.prevStepPlayer();
		const np = await getPlayer(gb, next);
		return np;
	}



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
		
		let t, ct, mp, t1, ct1, mp1;
		t = await gameBase.timeOut()
		ct = await gameBase.confirmTimeOut()
		mp = await gameBase.maxPlayers()
		await gameBase.setInfoDataTest(t.toNumber() + 10, ct.toNumber() + 10, mp.toNumber() + 10)
		t1 = await gameBase.timeOut()
		ct1 = await gameBase.confirmTimeOut()
		mp1 = await gameBase.maxPlayers()
		assert.equal(t1.toNumber(), t.toNumber() + 10, 'Изменение таймаута задержки перед ходами');
		assert.equal(ct1.toNumber(), ct.toNumber() + 10, 'Изменение таймаута задержки перед подтверждением');
		assert.equal(mp1.toNumber(), mp.toNumber() + 10, 'Изменение тМаксимального колисества игроков');
		await gameBase.setInfoDataTest(t.toNumber(), ct.toNumber(), mp.toNumber())
	});

	it('Добавление игроков', async () => {
		const gameBase = await GameBase.deployed();
		let pls, pl, tx;
		pls = await gameBase.getPlayersList();
		list.isArray(pls, 'start playerList()')
		assert.equal(pls.length, 0, 'Нет игроков при старте');

		await gameBase.setInfoDataTest(10,10,3);
		await gameBase.setStatusGame(GameStatus('Started'))
		await et(false, () => gameBase.addPlayerTest(accounts[0], PlayerMoveReason('GameCreate')), 'Нельзя добавлять игроков после начала игры')

		await gameBase.setStatusGame(GameStatus('Waiting'))
		tx = await et(true, () => gameBase.addPlayerTest(accounts[0], PlayerMoveReason('GameCreate')), 'можно добавлять игроков после начала игры')

		pls = await gameBase.getPlayersList();
		list.inList(pls, accounts[0], 'first addPlayer');
		pl = await gameBase.infoPlayers(accounts[0])
		pl = PlayerInfo(pl)
		assert.equal(pl.host, false, 'Значение host у игрока');
		assert.equal(pl.addr, accounts[0], 'Значение адреса у игрока');
		assert.equal(pl.steps, 0, 'Значение steps у игрока');
		assert.equal(pl.status, 'NotConfirmed', 'Значение status у игрока');
		assert.equal(pl.reason, 'GameCreate', 'Значение reason у игрока');

		checkEvents(tx,'AddPlayer',1,{
			pl: accounts[0],
			reason: PlayerMoveReason('GameCreate')
		})

		await gameBase.setHostTest(accounts[0])
		pl = await gameBase.infoPlayers(accounts[0])
		pl = PlayerInfo(pl)
		assert.equal(pl.host, true, 'Значение host у игрока после setHost');

		await gameBase.addPlayerTest(accounts[1], PlayerMoveReason('HostAdded'))
		pl = await gameBase.infoPlayers(accounts[1])
		pl = PlayerInfo(pl)
		assert.equal(pl.reason, 'HostAdded', 'Значение reason у второго игрока');
		pls = await gameBase.getPlayersList();
		list.inList(pls, accounts[1], 'second addPlayer');

		await et(false, () => gameBase.addPlayerTest(accounts[1], PlayerMoveReason('GameCreate')), 'Этот игрок уде добавлен')


		await gameBase.addPlayerTest(accounts[2], PlayerMoveReason('SelfAdded'))
		pl = await gameBase.infoPlayers(accounts[2])
		pl = PlayerInfo(pl)
		assert.equal(pl.reason, 'SelfAdded', 'Значение reason у третьего игрока');
		pls = await gameBase.getPlayersList();
		list.inList(pls, accounts[2], 'last addPlayer');

		await et(false, () => gameBase.addPlayerTest(accounts[3], PlayerMoveReason('GameCreate')), 'Достигнут лимит игроков')
		pl = await gameBase.infoPlayers(accounts[0])
		
	})

	it('Удаление игроков', async () => {
		const gameBase = await GameBase.deployed();
		let pl, plx, tx;
		plx = await gameBase.getPlayersList();
		assert.equal(plx.length, 3, 'Перед удалением все три АКК на месте');
		list.notInList(plx, accounts[4], `${accounts[4]} не в списке`)

		await et(false, ()=>gameBase.removePlayerTest(accounts[4], PlayerMoveReason('SelfRemoved')),'Нельзя удалить не добавленного пользователя')


		list.inList(plx, accounts[0], `${accounts[0]} в списке`)
		tx = await et(true, ()=>gameBase.removePlayerTest(accounts[0], PlayerMoveReason('SelfRemoved')),'Можно удалить добавленного пользователя')

		plx = await gameBase.getPlayersList();
		assert.equal(plx.length, 2, 'После первого удаления массив уменьшен');
		list.notInList(plx, accounts[0], `${accounts[0]} не в списке`)
		checkEvents(tx, 'RemovePlayer', 1, {
			pl: accounts[0],
			reason: PlayerMoveReason('SelfRemoved')
		})


		list.inList(plx, accounts[1], `${accounts[1]} в списке`)
		tx = await et(true, ()=>gameBase.removePlayerTest(accounts[1], PlayerMoveReason('SelfRemoved')),'Можно удалить добавленного пользователя')

		plx = await gameBase.getPlayersList();
		assert.equal(plx.length, 1, 'После второго удаления массив уменьшен');
		list.notInList(plx, accounts[0], `${accounts[0]} не в списке`)
		checkEvents(tx, 'RemovePlayer', 1, {
			pl: accounts[1],
			reason: PlayerMoveReason('SelfRemoved')
		})


		list.inList(plx, accounts[2], `${accounts[2]} в списке`)
		tx = await et(true, ()=>gameBase.removePlayerTest(accounts[2], PlayerMoveReason('SelfRemoved')),'Можно удалить добавленного пользователя')

		plx = await gameBase.getPlayersList();
		assert.equal(plx.length, 0, 'После третьего удаления массив уменьшен');
		list.notInList(plx, accounts[2], `${accounts[2]} не в списке`)
		checkEvents(tx, 'RemovePlayer', 1, {
			pl: accounts[2],
			reason: PlayerMoveReason('SelfRemoved')
		})
	})

	it('Подтверждение участия', async () => {
		const gameBase = await GameBase.deployed();
		let pl, tx;
		await gameBase.addPlayerTest(accounts[0], PlayerMoveReason('GameCreate'))

		await et(false, ()=>gameBase.confirmPlayerTest(accounts[1]),'Нельзя подвердить не добавленного игрока')
		tx = await et(true, ()=>gameBase.confirmPlayerTest(accounts[0]),'Можно подвердить добавленного игрока') 

		checkEvents(tx, 'ConfirmPlayer', 1, {
			pl: accounts[0]
		});

		await gameBase.removePlayerTest(accounts[0], PlayerMoveReason('SelfRemoved'))
	})

	it('Проверка допустимых интевалов при подтверждении', async () => {
		const gameBase = await GameBase.deployed();
		let plx, tx, t = 2;

		
		await gameBase.setInfoDataTest(10,t,10);

		await Promise.all([
			gameBase.addPlayerTest(accounts[0], PlayerMoveReason('GameCreate')),
			gameBase.addPlayerTest(accounts[1], PlayerMoveReason('GameCreate'))
		])
		plx = await gameBase.getPlayersList();
		list.inList(plx,accounts[0])
		list.inList(plx,accounts[1])
		
		tx = await et(true, ()=>gameBase.confirmPlayerTest(accounts[0]), `В течении ${t}sec возможно подтвердить участие`)

		checkEvents(tx, 'ConfirmPlayer', 1)

		await sleep(t*1500);

		await et(false, ()=>gameBase.confirmPlayerTest(accounts[1]), `После истечения ${t}sec невозможно подтвердить участие`)

		plx = await gameBase.getPlayersList();
		list.inList(plx,accounts[0])
		list.inList(plx,accounts[1])
				
		tx = await gameBase.checkPlayersGame()
		
		checkEvents(tx, 'RemovePlayer', 1, {
			pl: accounts[1],
			reason: PlayerMoveReason('WaitTime')
		})

		plx = await gameBase.getPlayersList();
		list.inList(plx,accounts[0])
		list.notInList(plx,accounts[1])
		
		await Promise.all(plx.map(addr => gameBase.removePlayerTest(addr, PlayerMoveReason('SelfRemoved'))))

	})

	it('Старт игры', async () => {
		const gameBase = await GameBase.deployed();
		let tx, t = 2, np, sg, tsg, time;
		
		await gameBase.setInfoDataTest(10,t,2);

		await et(false, ()=>gameBase.startGameTest(accounts[0]),'Нельзя запустить игру без всех участников')
		
		await Promise.all([
			gameBase.addPlayerTest(accounts[0], PlayerMoveReason('GameCreate')),
			gameBase.addPlayerTest(accounts[1], PlayerMoveReason('GameCreate'))
		])
		
		await gameBase.confirmPlayerTest(accounts[0])
		await gameBase.setStatusGame(GameStatus('Waiting'))
		await et(false, ()=>gameBase.startGameTest(accounts[0]),'Нельзя запустить игру без всех подтвержденных участников')

		await gameBase.setStatusGame(GameStatus('WaitingPlayers'))
		await gameBase.confirmPlayerTest(accounts[1])

		await et(false, ()=>gameBase.startGameTest(accounts[0]),'Нельзя запустить игру с неподходящим статусом')

		await gameBase.checkPlayersGame();

		await et(false, ()=>gameBase.startGameTest(address.ADDRESS),'Нельзя запустить игру с пустым первым игроком')


		await et(false, ()=>gameBase.startGameTest(accounts[2]),'Нельзя стартовать игру с неправильным адресом')


		time = new TimePoint();
		tx = await et(true, ()=>gameBase.startGameTest(accounts[1]),'Можно стартовать игру с правильным адресом')

		checkEvents(tx, 'StartGame', 1, {
			firstStep: accounts[1]
		})

		np = await gameBase.nextStepPlayer();
		sg = await gameBase.statusGame();
		tsg = await gameBase.timeStartGame();

		time.equal(tsg.toNumber(), 2);

		assert.equal(np, accounts[1], 'Правильно записанный первый игрок');
		assert.equal(GameStatus(sg), 'Started', 'Правильный статус игры после старта');

		np = await getPlayer(gameBase, np)


		assert.equal(np.status, 'Next', 'Правильный статус следующего игрока');

		const gameBase2 = await GameBase.new();		
		
		await gameBase2.setInfoDataTest(10,t,2);

		await addPlayersInGame(gameBase2, 2)

		time = new TimePoint();
		tx = await et(true, ()=>gameBase2.startGameTestEmpty(),'Можно стартовать игру без указания адреса')

		checkEvents(tx, 'StartGame', 1, {
			firstStep: accounts[0]
		})

		np = await gameBase2.nextStepPlayer();
		sg = await gameBase2.statusGame();
		tsg = await gameBase2.timeStartGame();

		time.equal(tsg.toNumber(), 2);

		assert.equal(np, accounts[0], 'Правильно записанный первый игрок без указания первого игрока при старте');
		assert.equal(GameStatus(sg), 'Started', 'Правильный статус игры после старта');

	});

	it('Проверка ходов', async () => {
		const gameBase = await GameBase.new();
		await gameBase.setInfoDataTest(2000,100,3);
		await addPlayersInGame(gameBase, 3);
		let pl, tx;

		await et(false, ()=>gameBase.innerStepTest(accounts[0], accounts[1]), 'Нельзя сделать ход до старта игры')

		await gameBase.startGameTestEmpty()

		await et(false, ()=>gameBase.innerStepTest(accounts[3], accounts[1]), 'Нельзя сделать от первого не учавствующего игрока')
		await et(false, ()=>gameBase.innerStepTest(accounts[0], accounts[3]), 'Нельзя сделать ход от второго не учавствующего игрока')
		await et(false, ()=>gameBase.innerStepTest(accounts[3], accounts[4]), 'Нельзя сделать ход от двух не учавствующих игроков')
		
		pl = await getPlayer(gameBase, accounts[0]);
		
		assert.equal(pl.status, 'Next', 'Правильный статус следующего игрока');
		pl = await getPlayer(gameBase, accounts[1]);
		assert.equal(pl.status, 'Waiting', 'Правильный статус первого игрока');
		pl = await getPlayer(gameBase, accounts[2]);
		assert.equal(pl.status, 'Waiting', 'Правильный статус второго игрока');

		tx = await et(true, ()=>gameBase.innerStepTest(accounts[1], accounts[2]), 'Можно сделать ход')

		checkEvents(tx, 'StepGame', {
			target: accounts[1],
			next: accounts[2]
		})

		pl = await getPlayer(gameBase, accounts[1]);
		assert.equal(pl.status, 'Waiting', 'правильный статус игрока, сделавшего ход');
		assert.equal(pl.steps, 1, 'Правильное количество ходов игрока, сделавшего ход');

		pl = await getPlayer(gameBase, accounts[2]);
		assert.equal(pl.status, 'Next', 'правильный статус игрока, указанного следующим');

		pl = await getPlayer(gameBase, accounts[0]);
		assert.equal(pl.status, 'Waiting', 'правильный статус игрока, указанного следующим при старте');


		tx = await gameBase.outerStepTest(accounts[1])
		

		checkEvents(tx, 'StepGame', {
			target: accounts[2],
			next: accounts[1]
		})

		pl = await getPlayer(gameBase, accounts[1]);
		
		assert.equal(pl.status, 'Waiting', 'правильный статус игрока, сделавшего ход [outerStep(address)]');
		assert.equal(pl.steps, 2, 'Правильное количество ходов игрока, сделавшего ход [outerStep(address)]');

		pl = await getPlayer(gameBase, accounts[2]);
		assert.equal(pl.status, 'Next', 'правильный статус игрока, указанного следующим [outerStep(address)]');

		tx = await gameBase.outerStepTestEmpty(); 

		checkEvents(tx, 'StepGame', {
			target: accounts[2],
			next: accounts[0]
		})


		pl = await getPlayer(gameBase, accounts[2]);
		
		assert.equal(pl.status, 'Waiting', 'правильный статус игрока, сделавшего ход [outerStep()]');
		assert.equal(pl.steps, 1, 'Правильное количество ходов игрока, сделавшего ход [outerStep()]');

		const pl2Steps = pl.steps;

		pl = await getPlayer(gameBase, accounts[0]);
		assert.equal(pl.status, 'Next', 'правильный статус игрока, указанного следующим [outerStep()]');

		const pl0Steps = pl.steps

		tx = await gameBase.innerStepTest(accounts[2], accounts[1]); 

		checkEvents(tx, 'StepGame', {
			target: accounts[2],
			next: accounts[1]
		})


		pl = await getPlayer(gameBase, accounts[2]);
		
		assert.equal(pl.status, 'Waiting', 'правильный статус игрока, сделавшего ход [innerStep()]');
		assert.equal(pl.steps, pl2Steps + 1, 'Правильное количество ходов игрока, сделавшего ход [innerStep()]');

		pl = await getPlayer(gameBase, accounts[1]);
		assert.equal(pl.status, 'Next', 'правильный статус игрока, указанного следующим [innerStep()]');

		pl = await getPlayer(gameBase, accounts[0]);
		
		assert.equal(pl.status, 'Waiting', 'правильный статус игрока, пропустившего ход [innerStep()]');
		assert.equal(pl.steps, pl0Steps, 'Правильное количество ходов игрока, пропустившего ход [innerStep()]');
	})

	it('Переход хода', async () => {
		const gameBase = await GameBase.new();
		await gameBase.setInfoDataTest(200,100,8);
		await addPlayersInGame(gameBase, 8);

		await et(false, ()=>gameBase.changeNextPlayer(accounts[0]),'Нельзя использовать переход хода до старта игры')
		await et(false, ()=>gameBase.changeNextPlayer(),'Нельзя использовать переход хода до старта игры')

		await gameBase.startGameTestEmpty();

		await et(false, ()=>gameBase.changeNextPlayer(accounts[9]),'Нельзя использовать переход хода с указанием не учавствующего игрока')

		let pl, tx, time, eto, np;
		
		tx = await gameBase.outerStepTestEmpty();
		time = tx.logs[0].args.time.toNumber();
		np = await gameBase.nextStepPlayer();
		eto = await gameBase.endpointTime();

		assert.equal(np, accounts[1], 'Следующий игрок указан правильно [1]');
		assert.equal(eto.toNumber(), time + 200, 'Допустимое время следующего хода указанно правильно [1]');

		tx = await et(true, ()=>gameBase.changeNextPlayerTest(accounts[3]),'Можно сменить угрока')

		checkEvents(tx,'ChangeNextPlayer',1,{
			target: accounts[3],
			prev: accounts[1]
		})

		time = tx.logs[0].args.time.toNumber();
		np = await gameBase.nextStepPlayer();
		eto = await gameBase.endpointTime();

		assert.equal(np, accounts[3], 'Следующий игрок указан правильно при смене игрока');
		assert.equal(eto.toNumber(), time + 200, 'Допустимое время следующего хода указанно правильно при смене игрока');

		tx = await gameBase.outerStepTestEmpty();
		checkEvents(tx, 'StepGame', {
			target: accounts[3],
			next: accounts[4]
		})
		time = tx.logs[0].args.time.toNumber();
		np = await gameBase.nextStepPlayer();
		eto = await gameBase.endpointTime();

		assert.equal(np, accounts[4], 'Следующий игрок указан правильно [2]');
		assert.equal(eto.toNumber(), time + 200, 'Допустимое время следующего хода указанно правильно [2]');




		tx = await gameBase.changeNextPlayerTestEmpty()

		checkEvents(tx,'ChangeNextPlayer',1,{
			target: accounts[5],
			prev: accounts[4]
		})

		time = tx.logs[0].args.time.toNumber();
		np = await gameBase.nextStepPlayer();
		eto = await gameBase.endpointTime();

		assert.equal(np, accounts[5], 'Следующий игрок указан правильно при переходе хода');
		assert.equal(eto.toNumber(), time + 200, 'Допустимое время следующего хода указанно правильно при переходе хода');


		tx = await gameBase.outerStepTestEmpty();
		checkEvents(tx, 'StepGame', {
			target: accounts[5],
			next: accounts[6]
		})
		time = tx.logs[0].args.time.toNumber();
		np = await gameBase.nextStepPlayer();
		eto = await gameBase.endpointTime();

		assert.equal(np, accounts[6], 'Следующий игрок указан правильно [3]');
		assert.equal(eto.toNumber(), time + 200, 'Допустимое время следующего хода указанно правильно [3]');

	});

	it('Проверка допустимых интевалов при осуществлении хода в игре', async () => {
		const timeOut = 3
		const to = timeOut * 1000;
		const gameBase = await GameBase.new();
		await gameBase.setInfoDataTest(timeOut,100,5);
		await addPlayersInGame(gameBase, 5);
		await gameBase.startGameTestEmpty();
		let pl, tx;

		const step = async (status, num) => {
			let plStepsPrev, plStepsNext, txs, pp, np, eto, time;
			pp = await gameBase.nextStepPlayer();
			plStepsPrev = await getPlayer(gameBase, pp);
			plStepsPrev = plStepsPrev.steps;
			txs = await et(true, ()=>gameBase.outerStepTestEmpty(), `${status ? 'Можно сделать ход' : 'Нельзя сделать ход'} [${num}]`);
			np = await gameBase.nextStepPlayer();
			eto = await gameBase.endpointTime();
			plStepsNext = await getPlayer(gameBase, pp);
			plStepsNext = plStepsNext.steps;

			checkEvents(txs, (status ? 'StepGame' : 'TransitionSpeed'), 1, {
				target: pp,
				next: np
			})
			time = txs.logs[0].args.time.toNumber()

			assert.equal(eto.toNumber(), time + timeOut, `Допустимое время следующего хода указанно правильно [${num}]`);
			assert.equal(plStepsNext, status ? plStepsPrev + 1 : plStepsPrev, `Количество ходов совпадает [${num}]`);
			return txs;
		}
		
		await step(true, 1)
		await sleep(50)
		await step(true, 2)

		
		await sleep(to)
		tx = await step(false, 3)


		await sleep(to/2)
		await step(true, 4)

		await sleep(to*2);
		await step(false, 5);
		
	});

	it('Завершение игры', async () => {
		const gameBase = await GameBase.deployed();

	})
	
	it('Проверка доступности по статусу игры', async () => {
		const gameBase = await GameBase.deployed();
		await gameBase.setStatusGame(GameStatus('Started'))
		await et(false, ()=>gameBase.outerStepTest(), '[ outerStep ] Недоступен до старта игры');
	});
})
