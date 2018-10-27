pragma solidity ^0.4.24; 

import '../lib/contracts/Owned.sol';

// TicTacToe
contract Game is Owned {
	address public playerX; 
	address public player0; 
	address private parentContract;
	bool public ready; 
	bool public next; 
	bool public end;
	bool public winner;
	uint public startTime;
	uint public endTime;
	uint public lastStep;
	uint public maxWait;
	
	enum FieldStatus { FieldEmpty, FieldX, Field0 }
	enum GameResultStatus {
		Waiting,           // [ 0 ] Ожидание второго игрока
		ConfirmWaiting,    // [ 1 ] Ожидание подтверждения от второго игрока
		StepWaiting,       // [ 2 ] Ожидание первого хода
		GameStarted,       // [ 3 ] Игра началась
		RemoveFirstPlayer, // [ 4 ] удалено первым игроком
		LongWaiting,       // [ 5 ] слишком длинное ожидание
		Capitulate,        // [ 6 ] игрок сдался
		Win                // [ 7 ] победа
	}

	GameResultStatus public status;

	event StartGame(address playerX, address player0, bool first );
	event StepGame(address player, bool playerType, uint8 field);
	event EndGame(address player, bool playerType, GameResultStatus status);
	
	FieldStatus[10] public fields;


	modifier onlyPlayers() {
		require(msg.sender == playerX || msg.sender == player0);
		_;
	}

	modifier onlyNextPlayer() {
		require((next && msg.sender == playerX) || (!next && msg.sender == player0));
		_;
	}

	constructor(address _player1, address _player2, bool _first, uint _maxWait, address _parent) public {
		require(_player1 != _player2); 
		next = _first; 
		if (next) {
			playerX = _player1; 
			player0 = _player2; 
		} else {
			player0 = _player1; 
			playerX = _player2; 
		}
		
		status = _player2 == address(0) ? GameResultStatus.Waiting : GameResultStatus.ConfirmWaiting;
		maxWait = _maxWait;
		parentContract = _parent;
	}

	function confirmGame() public {
		require( !ready); 
		if (next && player0 == address(0)) {
			require(msg.sender != playerX); 
			player0 = msg.sender; 
		} else if ( !next && playerX == address(0)) {
			require(msg.sender != player0); 
			playerX = msg.sender; 
		} else if (next) {
			require(msg.sender == player0); 
		} else {
			require(msg.sender == playerX); 
		}

		status = GameResultStatus.StepWaiting;
		startTime = block.timestamp;
		emit StartGame(playerX, player0, next);
		ready = true; 
	}

	function getFields() view public returns(FieldStatus[10]) {
		return fields;
	}



	function step(uint8 setField) public onlyNextPlayer {
		require(ready);
		require(setField > 0 && setField <= 9);
		require(fields[setField] == FieldStatus.FieldEmpty);
		if (status == GameResultStatus.StepWaiting) {
			status = GameResultStatus.GameStarted;
		}
		if (msg.sender == playerX) {
			fields[setField] = FieldStatus.FieldX;
		} else {
			fields[setField] = FieldStatus.Field0;
		}
		next = !next;
		emit StepGame(msg.sender, !next, setField);
		checkWinner(setField, fields[setField]);
	}

	function checkWinner(uint8 f, FieldStatus tp) public {
		uint8 row = f/3;
		uint8 rowLength;
		uint8 col = f%3;
		uint8 colLength;
		bool canD = ((f%2) != 0 && fields[5] == tp) ;
		bool dWin;
		uint8 i;
		uint8 t;


		if (col > 0) {
			row += 1;
		} else {
			col = 3;
		}
		for (i=1; i<4; i++) {
			t = ((row - 1) * 3) + i;
			if (fields[t] == tp) {
				rowLength += 1;
			}

			t = ((i - 1) * 3) + col;
			if (fields[t] == tp) {
				colLength += 1;
			}
		}

		if (canD) {
			if ((fields[1] == tp && fields[9] == tp) || (fields[3] == tp && fields[7] == tp)) {
				dWin = true;
			} 
		}

		if (rowLength == 3 || colLength == 3 || dWin) {
			win((tp == FieldStatus.FieldX), GameResultStatus.Win);
		}

	}

	function win(bool playerType, GameResultStatus _status) private {
		end = true;
		winner = playerType;
		status = _status;
		endTime = block.timestamp;
		address playerWinner = playerType ? playerX : player0;
		emit EndGame(playerWinner, playerType, _status);
	}

	function getWinner() view public returns(bool, FieldStatus, address, GameResultStatus) {
		address _win;
		FieldStatus fStatus = FieldStatus.FieldEmpty;
		if (end) {
			if (winner) {
				_win = playerX;
				fStatus = FieldStatus.FieldX;
			} else {
				_win = player0;
				fStatus = FieldStatus.Field0;
			}
		}
		return (end, fStatus, _win, status);
	}

	
}