pragma solidity ^0.4.24;

import "../base/GameBase.sol";


contract GameBaseTest is GameBase {
	uint private __hostModifTest;

	function onlyHostTest() public onlyHost {
		__hostModifTest = now;
	}

	function setInfoDataTest(uint _timeOut, uint _confirmTimeOut, uint _maxPlayers) public {
		setInfoData(_timeOut, _confirmTimeOut, _maxPlayers);
	}

	function setStatusGame(uint status) public {
		statusGame = GameStatus(status);
	}


	function addPlayerTest(address pl, PlayerMoveReason _reason) public {
		addPlayer(pl, _reason);
	}

	function confirmPlayerTest(address pl) public {
		confirmPlayer(pl);
	}

	function removePlayerTest(address pl, PlayerMoveReason reason) public {
		removePlayer(pl, reason);
	}
	function innerStepTest(address pl, address plNext) public {
		innerStep(pl, plNext);
	}
	function outerStepTest() public {
		outerStep();
	}
	function outerStepTest(address pl) public {
		outerStep(pl);
	}
	
	function setHostTest(address pl) public {
		setHost(pl);
	}

	function startGameTest(address firstStep) public {
		startGame(firstStep);
	}
	function startGameTest() public {
		startGame();
	}

	function innerWinTest(address pl) public {
		innerWin(pl);
	}

	function outerWinTest() public {
		outerWin();
	}
}