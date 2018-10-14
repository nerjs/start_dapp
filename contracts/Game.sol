pragma solidity ^0.4.2;
import "./Owned.sol";

// TicTacToe
contract Game is Owned {
	address public playerX;
	address public player0;
	bool public ready;
	bool public next;



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

	function confirmGame() public {
		require(!ready);
		if (next && player0 == address(0)) {
			require(msg.sender != playerX);
			player0 = msg.sender;
		} else if (!next && playerX == address(0)) {
			require(msg.sender != player0);
			playerX = msg.sender;
		} else if (next) {
			require(msg.sender == player0);
		} else {
			require(msg.sender == playerX);
		}

		ready = true;
	}
}