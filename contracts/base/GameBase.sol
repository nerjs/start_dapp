pragma solidity ^0.4.25;

import "../libs/AddrArr.sol";


contract GameBase {
	using AddrArr for *;

	/**
	 *   Статус игрока внутри игрового процесса
	 */
	enum PlayerStatus {
		Empty,         // [ 0 ] Пустой слот
		NotConfirmed,  // [ 1 ] Не подтвердил участие.
		Waiting,       // [ 2 ] Подтвержден и ожидает игры/хода
		Next,          // [ 3 ] Следующий ход за игроком
		Capitulate,    // [ 4 ] Проиграл. Причина - сдался
		LossTimeLimit, // [ 5 ] Проиграл. Причина - истекло время ожидания
		Loss,          // [ 6 ] Проиграл
		Win            // [ 7 ] Победил
	}


	/**
	 *  Статус игрока вне игрового процесса
	 *	Добавление, удаление, причины
	 */
	
	enum PlayerMoveReason {
		GameCreate,   // [ 0 ] Добавлен при создании игры
		HostAdded,    // [ 1 ] Добавлен хостом
		SelfAdded,    // [ 2 ] Добавился самостоятельно
		Invite,       // [ 3 ] Добавил один из игроков
		HostRemoved,  // [ 4 ] Удален хостом
		SelfRemoved,  // [ 5 ] Удалился сам
		WaitTime,     // [ 6 ] Истекло время ожидания подтверждения
		BasisPlayers  // [ 7 ] Удален решением игроков
	}

	enum GameStatus {
		Waiting,         // [ 0 ] Ожидание начала игры
		WaitingPlayers,  // [ 1 ] Ожидание игроков
		Started,         // [ 2 ] Игра началась
		Ended            // [ 3 ] Игра закончилась
	}

	struct PlayerInfo {
		bool host;                // [ 0 ] является ли первым игроком (на случай, если у первого игрока есть какие либо разширенные права)
		address addr;             // [ 1 ] аддресс игрока
		uint confirmEndpoint;     // [ 2 ] конечная временная метка ожидания игрока
		uint steps;               // [ 3 ] количество совершенных ходов
		PlayerStatus status;      // [ 4 ] Текущий статус
		PlayerMoveReason reason;  // [ 5 ] Причина добавления
	}

	event AddPlayer(address pl, PlayerMoveReason reason, uint cto);
	event RemovePlayer(address pl, PlayerMoveReason reason);
	event ConfirmPlayer(address pl);
	event TransitionSpeed(address target, address next);
	event StepGame(address target, address next);
	event StartGame(uint time, address firstStep);
	event EndGame(uint time, address winner, uint playerSteps, uint steps);

	
	uint public timeOut;
	uint public confirmTimeOut;
	uint public endpointTime;
	uint public maxPlayers;
	uint public allSteps;
	uint public timeStartGame;
	uint public timeEndGame;
	address public host;
	address public winner;
	address public nextStepPlayer;
	address public prevStepPlayer;

	GameStatus public statusGame;
	mapping(address => PlayerInfo) public infoPlayers;
	address[] public listPlayers;



	modifier onlyHost() { 
		require(infoPlayers[msg.sender].host, "Доступ запрещен всем, кроме хоста"); 
		_; 
	} 

	modifier onlyPlayerFor(address pl, bool inGame) {
		require(listPlayers.indexOf(pl) != uint(-1), "Действие разрешено только игрокам");
		if (inGame) {
			require(infoPlayers[pl].status == PlayerStatus.Waiting || infoPlayers[pl].status == PlayerStatus.Next, "Действие разрешено только активным игрокам");
		}
		_;
	}

	modifier onlyPlayer() {
		require(infoPlayers[msg.sender].status != PlayerStatus.Empty, "Действие разрешено только игрокам");
		_;
	}

	modifier onlyStarted() { 
		require(statusGame == GameStatus.Started, "Действие возможно только для идущей игры"); 
		_; 
	}

	modifier onlyNotStarted() { 
		require((statusGame == GameStatus.Waiting || statusGame == GameStatus.WaitingPlayers), "Действие возможно только до начала игры"); 
		_; 
	}

	modifier onlyWaitingPlayers() {
		require(statusGame == GameStatus.WaitingPlayers, "Доступ к методу возможен только в режиме ожидания игроков");
		_;
	}

	modifier onlyEnded() { 
		require(statusGame == GameStatus.Ended, "Действие возможно только после завершения игры"); 
		_; 
	}

	modifier onlyReady() {
		require(statusGame == GameStatus.Waiting, "Действие возможно только в режиме ожидания");
		require(listPlayers.length == maxPlayers, "Дествие возможно только при полном списке игроков");
		_;
	}


	function checkPlayerStep() public onlyStarted returns(bool) {
		if (endpointTime < now) return true;
		address prev = nextStepPlayer;
		nextStepPlayer = listPlayers.next(prev, true);
		emit TransitionSpeed(prev, nextStepPlayer);
		return false;
	}



	function checkPlayersGame() public onlyNotStarted {
		if (listPlayers.length < maxPlayers) {
			statusGame = GameStatus.WaitingPlayers;
			return;
		}

		bool hasNC;
		for (uint i = 0; i < listPlayers.length; i++) {
			if (infoPlayers[listPlayers[i]].status != PlayerStatus.NotConfirmed) continue;
			if (infoPlayers[listPlayers[i]].confirmEndpoint > now) {
				hasNC = true;
			} else {
				removePlayer(listPlayers[i], PlayerMoveReason.WaitTime);
			}
		}

		if (hasNC || listPlayers.length < maxPlayers) {
			statusGame = GameStatus.WaitingPlayers;
		} else {
			statusGame = GameStatus.Waiting;
		}

	} 
	

	function addPlayer(address pl, PlayerMoveReason _reason) internal onlyNotStarted {
		require(statusGame != GameStatus.Started && statusGame != GameStatus.Ended, "Нельзя добавлять гроков после начала игры");
		require(infoPlayers[pl].status == PlayerStatus.Empty, "Этот игрок уде добавлен");
		require(listPlayers.length >= (maxPlayers - 1), "Достигнут лимит игроков");
		listPlayers.push(pl);
		uint cto = (now + confirmTimeOut);
		infoPlayers[pl] = PlayerInfo(
				false,
				pl,
				cto,
				0,
				PlayerStatus.NotConfirmed,
				_reason
			);

		emit AddPlayer(pl, _reason, cto);
	}


	function confirmPlayer(address pl) internal onlyNotStarted onlyPlayerFor(pl, false) {
		require(infoPlayers[pl].status == PlayerStatus.NotConfirmed, "Игрок не нуждается в подтверждении");
		infoPlayers[pl].status = PlayerStatus.Waiting;
		infoPlayers[pl].confirmEndpoint = 0;
		checkPlayersGame();
		emit ConfirmPlayer(pl);
	}

	function removePlayer(address pl, PlayerMoveReason reason) internal onlyNotStarted onlyPlayerFor(pl, false) {
		require(infoPlayers[pl].status != PlayerStatus.Empty, "Этот игрок еще не добавлен");
		listPlayers.remove(pl);
		delete infoPlayers[pl];
		checkPlayersGame();
		emit RemovePlayer(pl, reason);
	}


	function innerStep(address pl, address plNext) internal onlyStarted onlyPlayerFor(pl, true) onlyPlayerFor(plNext, true) {
		infoPlayers[pl].status = PlayerStatus.Waiting;
		infoPlayers[pl].steps++;
		prevStepPlayer = pl; 
		nextStepPlayer = plNext; 
		infoPlayers[nextStepPlayer].status = PlayerStatus.Next;
		
		emit StepGame(pl, nextStepPlayer);
	}

	function outerStep(address pl) internal onlyStarted onlyPlayerFor(pl, true) {
		if (!checkPlayerStep()) return;
		address prev = nextStepPlayer;
		nextStepPlayer = pl;
		nextStepPlayer = listPlayers.next(prev, true);
		innerStep(prev, nextStepPlayer);
	}

	function outerStep() internal {
		outerStep(listPlayers.next(nextStepPlayer, true));
	}


	function startGame(address firstStep) internal onlyReady onlyPlayerFor(firstStep, true) {
		require(firstStep != address(0), "Первый игрок обязателен");
		timeStartGame = now;
		statusGame = GameStatus.Started;
		nextStepPlayer = firstStep;
		emit StartGame(now, firstStep);
	}

	function startGame() internal {
		startGame(listPlayers[0]);
	}

	function innerWin(address pl) internal onlyStarted  onlyPlayerFor(pl, true) {
		statusGame = GameStatus.Ended;
		timeEndGame = now;
		winner = pl;

		emit EndGame(now, pl, infoPlayers[pl].steps, allSteps);
	} 

	function outerWin() internal onlyStarted {
		innerWin(prevStepPlayer);
	}



}