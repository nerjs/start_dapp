pragma solidity ^0.4.24; 

import '../lib/contracts/Owned.sol';

// TicTacToe
contract Game is Owned {
	address public playerX; 
	address public player0; 
	bool public ready; 
	bool public next; 
	bool public end;
	bool public winner;
	
	enum FieldStatus { FieldEmpty, FieldX, Field0 }
	event StartGame(address playerX, address player0, bool first );
	event StepGame(address player, bool playerType, uint8 field);
	
	FieldStatus[10] public fields;


	modifier onlyPlayers() {
		require(msg.sender == playerX || msg.sender == player0);
		_;
	}

	modifier onlyNextPlayer() {
		require((next && msg.sender == playerX) || (!next && msg.sender == player0));
		_;
	}

	constructor(address _player1, address _player2, bool _first) public {
		require(_player1 != _player2); 
		next = _first; 
		if (next) {
			playerX = _player1; 
			player0 = _player2; 
		} else {
			player0 = _player1; 
			playerX = _player2; 
		}
		

	}

	function confirmGame()public {
		require( ! ready); 
		if (next && player0 == address(0)) {
			require(msg.sender != playerX); 
			player0 = msg.sender; 
		} else if ( ! next && playerX == address(0)) {
			require(msg.sender != player0); 
			playerX = msg.sender; 
		} else if (next) {
			require(msg.sender == player0); 
		} else {
			require(msg.sender == playerX); 
		}

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
		if (msg.sender == playerX) {
			fields[setField] = FieldStatus.FieldX;
		} else {
			fields[setField] = FieldStatus.Field0;
		}
		next = !next;
		emit StepGame(msg.sender, !next, setField);
		checkWinner();
	}

	function checkWinner() public {

	}
}