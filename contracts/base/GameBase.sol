pragma solidity ^0.4.24;

import "../libs/AddrArr.sol";


contract GameBase {
	using AddrArr for *;

	/**
	* @title Статус игрока внутри игрового процесса
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
	 * @title Статус игрока вне игрового процесса
	 * @dev Добавление, удаление, причины
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

	/**
	* @title Статус игры
	 */
	enum GameStatus {
		Waiting,         // [ 0 ] Ожидание начала игры
		WaitingPlayers,  // [ 1 ] Ожидание игроков
		Started,         // [ 2 ] Игра началась
		Ended            // [ 3 ] Игра закончилась
	}

	/** 
	* @title Информация об игроке
	 */
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
	event SetHost(address player);
	event TransitionSpeed(address target, address next, uint time);
	event StartGame(uint time, address firstStep);
	event StepGame(address target, address next, uint time);
	event ChangeNextPlayer(address target, address prev, uint time);
	event EndGame(uint time, address winner, uint playerSteps, uint steps);

	
	uint public timeOut = 0;           // Допустимая задержка времени между ходами
	uint public confirmTimeOut;    // Допустимая задержка времени перед подтверждением участия
	uint public endpointTime;      // Отметка времени, после которой происходит переход хода
	uint public maxPlayers;        // Максимальное количество игроков
	uint public allSteps;          // Общее количество игроков
	uint public timeStartGame;     // Отметка времени - начало игры
	uint public timeEndGame;       // Отметка времени - конец игры
	address public host;           // Адресс хоста
	address public winner;         // Адрес победитиля
	address public nextStepPlayer; // Адрес игрока, который должен ходить  следующим
	address public prevStepPlayer; // Адрес игрока, который ходил предидущим

	GameStatus public statusGame;                       // Статус игры
	mapping(address => PlayerInfo) public infoPlayers; // Информация об игрока 
	address[] public listPlayers;                      // Список игроков



	modifier onlyHost() { 
		require(infoPlayers[msg.sender].host, "Действие запрещено всем, кроме хоста"); 
		_; 
	} 
	
	modifier onlyPlayer() {
		require(infoPlayers[msg.sender].status != PlayerStatus.Empty, "Действие разрешено только игрокам");
		_;
	}

	modifier onlyPlayerFor(address pl, bool inGame) {
		require(listPlayers.indexOf(pl) != uint(-1), "Действие разрешено только относительно игроков");
		if (inGame) {
			require(infoPlayers[pl].status == PlayerStatus.Waiting || infoPlayers[pl].status == PlayerStatus.Next, "Действие разрешено только активным игрокам");
		}
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
		for (uint i = 0; i < listPlayers.length; i++) {
			require(infoPlayers[listPlayers[i]].status != PlayerStatus.Empty, "Пустой слот игрока");
			require(infoPlayers[listPlayers[i]].status != PlayerStatus.NotConfirmed, "Игрок не подтвержден");
		}
		_;
	}




	function inGame(address pl) public view returns(bool) {
		return listPlayers.indexOf(pl) != uint(-1);
	}


	function checkPlayerStep() public onlyStarted returns(bool) {
		if (endpointTime > now) return true;
		address prev = nextStepPlayer;
		nextStepPlayer = listPlayers.next(prev, true);
		endpointTime = now + timeOut;
		emit TransitionSpeed(prev, nextStepPlayer, now);
		return false;
	}


	function checkPlayersGame() public onlyNotStarted {
		bool hasNC;
		address[] memory ra = new address[](listPlayers.length);
		uint i;

		for (i = 0; i < listPlayers.length; i++) {
			if (infoPlayers[listPlayers[i]].status != PlayerStatus.NotConfirmed) continue;
			if (infoPlayers[listPlayers[i]].confirmEndpoint > now) {
				hasNC = true;
			} else {
				ra[i] = listPlayers[i];
			}
		}

		if (ra.length > 0) {
			for (i = 0; i < ra.length; i++) {
				if (ra[i] == address(0)) continue;
				removePlayer(ra[i], PlayerMoveReason.WaitTime);
			}
		}

		if (hasNC || listPlayers.length < maxPlayers) {
			statusGame = GameStatus.WaitingPlayers;
		} else {
			statusGame = GameStatus.Waiting;
		}

	} 
	
	function setInfoData(uint _timeOut, uint _confirmTimeOut, uint _maxPlayers) internal onlyNotStarted {
		timeOut = _timeOut;
		confirmTimeOut = _confirmTimeOut;
		maxPlayers = _maxPlayers;
	}

	function addPlayer(address pl, PlayerMoveReason _reason) internal onlyNotStarted {
		require(statusGame != GameStatus.Started && statusGame != GameStatus.Ended, "Нельзя добавлять гроков после начала игры");
		require(infoPlayers[pl].status == PlayerStatus.Empty, "Этот игрок уде добавлен");
		require(listPlayers.length < maxPlayers, "Достигнут лимит игроков");
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

	function setHost(address pl) internal onlyPlayerFor(pl, false) {
		infoPlayers[host].host = false;
		infoPlayers[pl].host = true;
		host = pl;
		emit SetHost(pl);
	}


	function confirmPlayer(address pl) internal onlyNotStarted onlyPlayerFor(pl, false) {
		require(infoPlayers[pl].status == PlayerStatus.NotConfirmed, "Игрок не нуждается в подтверждении");
		require(infoPlayers[pl].confirmEndpoint >= now, "Подтверждение невозможно. Истекло допустимое время подтверждения");
		if (!inGame(pl)) return;
		infoPlayers[pl].status = PlayerStatus.Waiting;
		infoPlayers[pl].confirmEndpoint = 0;
		emit ConfirmPlayer(pl);
	}

	function removePlayer(address pl, PlayerMoveReason reason) internal onlyNotStarted onlyPlayerFor(pl, false) {
		listPlayers.remove(pl);
		delete infoPlayers[pl];
		emit RemovePlayer(pl, reason);
	}


	function startGame(address firstStep) internal onlyReady onlyPlayerFor(firstStep, true) {
		require(firstStep != address(0), "Первый игрок обязателен");
		timeStartGame = now;
		endpointTime = now + timeOut;
		statusGame = GameStatus.Started;
		nextStepPlayer = firstStep;
		infoPlayers[firstStep].status = PlayerStatus.Next;
		emit StartGame(now, firstStep);
	}

	function startGame() internal {
		startGame(listPlayers[0]);
	}
 

	function innerStep(address pl, address plNext) internal onlyStarted onlyPlayerFor(pl, true) onlyPlayerFor(plNext, true) {
		infoPlayers[pl].status = PlayerStatus.Waiting;
		if (pl != nextStepPlayer) {
			infoPlayers[nextStepPlayer].status = PlayerStatus.Waiting;
		}
		infoPlayers[pl].steps++;
		prevStepPlayer = pl; 
		nextStepPlayer = plNext; 
		infoPlayers[nextStepPlayer].status = PlayerStatus.Next;
		endpointTime = now + timeOut;
		allSteps += 1;
		
		emit StepGame(pl, nextStepPlayer, now);
	}

	function outerStep(address pl) internal onlyStarted onlyPlayerFor(pl, true) {
		if (!checkPlayerStep()) return;
		prevStepPlayer = pl;
		nextStepPlayer = listPlayers.next(pl, true);
		innerStep(prevStepPlayer, nextStepPlayer);
	}

	function outerStep() internal {
		outerStep(nextStepPlayer);
	}

	function changeNextPlayer(address pl) internal onlyStarted onlyPlayerFor(pl, true) {
		address prev = nextStepPlayer;
		nextStepPlayer = pl;
		endpointTime = now + timeOut;
		emit ChangeNextPlayer(pl, prev, now);
	}


	function changeNextPlayer() internal {
		address pl = listPlayers.next(nextStepPlayer, true);
		changeNextPlayer(pl);
	}

	function innerWin(address pl) internal onlyStarted  onlyPlayerFor(pl, true) {
		statusGame = GameStatus.Ended;
		timeEndGame = now;
		winner = pl;

		emit EndGame(now, pl, infoPlayers[pl].steps, allSteps);
	} 

	function innerWin() internal {
		innerWin(prevStepPlayer);
	}



}