pragma solidity ^0.4.24;

import "../base/GameBase.sol";


contract GameBaseTest is GameBase {

	// модификаторы

	uint private __hostModifTest;

	function testOnlyHost() public onlyHost {
		__hostModifTest = now;
	}

	function testOnlyPlayer() public onlyPlayer {
		__hostModifTest = now;
	}

	function testOnlyPlayerFor(address pl, bool inGame) public onlyPlayerFor(pl, inGame) {
		__hostModifTest = now;
	}

	function testOnlyStarted() public onlyStarted {
		__hostModifTest = now;
	}

	function testOnlyNotStarted() public onlyNotStarted {
		__hostModifTest = now;
	}

	function testOnlyWaitingPlayers() public onlyWaitingPlayers {
		__hostModifTest = now;
	}

	function testOnlyEnded() public onlyEnded {
		__hostModifTest = now;
	}

	function testOnlyReady() public onlyReady {
		__hostModifTest = now;
	}


	// методы

	function setInfoDataTest(uint _timeOut, uint _confirmTimeOut, uint _maxPlayers) public {
		setInfoData(_timeOut, _confirmTimeOut, _maxPlayers);
	}

	function setStatusGame(uint status) public {
		statusGame = GameStatus(status);
	}


	function getPlayersList() public view returns(address[]) {
		return listPlayers;
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
	function outerStepTestEmpty() public {
		outerStep();
	}
	function outerStepTest(address pl) public {
		outerStep(pl);
	}

	function changeNextPlayerTest(address pl) public {
		changeNextPlayer(pl);
	}

	function changeNextPlayerTestEmpty() public {
		changeNextPlayer();
	}
	
	function setHostTest(address pl) public {
		setHost(pl);
	}
	function startGameTestEmpty() public {
		startGame();
	}

	function startGameTest(address firstStep) public {
		startGame(firstStep);
	}

	function innerWinTest(address pl) public {
		innerWin(pl);
	}

	function outerWinTest() public {
		innerWin();
	}

}