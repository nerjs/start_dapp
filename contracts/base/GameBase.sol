pragma solidity ^0.4.24;

import "../libs/AddrArr.sol";
import "../helpers/Owned.sol";


contract GameBase {
	using AddrArr for *;

	/**
	 *   Статус игрока внутри игрового процесса
	 */
	enum PlayerStatus {
		Empty          // [ 0 ] Пустой слот
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

	
	uint public timeOut;
	uint public confirmTimeOut;
	uint public endpointTime;
	uint public maxPlayers;
	address host;
	address public nextStepPlayer;

	GameStatus statusGame;
	mapping(address => PlayerInfo) public infoPlayers;
	address[] public listPlayers;


	modifier onlyHost() { 
		require(infoPlayers[msg.sender].host, "Доступ запрещен всем, кроме хоста"); 
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

	modifier onlyEnded() { 
		require(statusGame == GameStatus.Ended, "Действие возможно только после завершения игры"); 
		_; 
	}
	

	function addPlayer(address pl, PlayerMoveReason _reason) internal onlyNotStarted {
		require(statusGame != GameStatus.Started && statusGame != GameStatus.Ended, "Нельзя добавлять гроков после начала игры");
		require(infoPlayers[pl].status == PlayerStatus.Empty, "Этот игрок уде добавлен");
		require(listPlayers.length >= (maxPlayers - 1), "Достигнут лимит игроков");
		listPlayers.push(pl);
		uint cto = (now + confirmTimeOut);
		infoPlayers[pl] = PlayerInfo(
				false,
				addr: pl,
				cto,
				0,
				PlayerStatus.NotConfirmed,
				reason
			);

		emit AddPlayer(pl, reason, cto);
	}


	function confirmPlayer(address pl) internal onlyNotStarted {
		require(infoPlayers[pl].status == PlayerStatus.NotConfirmed, "Игрок не нуждается в подтверждении");
		infoPlayers[pl].status = PlayerStatus.Waiting;
		infoPlayers[pl].confirmEndpoint = 0;
		emit ConfirmPlayer(pl);
	}

	function removePlayer(address pl, PlayerMoveReason reason) internal onlyNotStarted {
		require(infoPlayers[pl].status != PlayerStatus.Empty, "Этот игрок еще не добавлен");
		listPlayers.remove(pl);
		delete infoPlayers[pl];
		emit RemovePlayer(pl, reason);
	}

	function checkPlayersGame() internal onlyNotStarted {

		bool hasNC;
		for (uint i = 0; i < listPlayers.length; i++) {
			if (infoPlayers[listPlayers[i]].status != PlayerStatus.NotConfirmed) continue;
			if (infoPlayers[listPlayers[i]].confirmEndpoint > now) {
				hasNC = true;
			} else {
				removePlayer(listPlayers[i], PlayerMoveReason.WaitTime);
			}
		}

		if (hasNC) {
			statusGame = GameStatus.WaitingPlayers;
		} else {
			statusGame = GameStatus.Waiting;
		}

	}

}