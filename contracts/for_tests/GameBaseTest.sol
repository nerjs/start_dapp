pragma solidity ^0.4.24;

import "../base/GameBase.sol";


contract GameBaseTest is GameBase {
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
	
}