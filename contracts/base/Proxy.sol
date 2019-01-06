pragma solidity ^0.4.24;


import "../interfaces/TargetProxy.sol";


contract Proxy {
	address public targetContract;

	uint public timeOut;           // Допустимая задержка времени между ходами
	uint public confirmTimeOut;    // Допустимая задержка времени перед подтверждением участия
	uint public endpointTime;      // Отметка времени, после которой происходит переход хода
	uint public maxPlayers;        // Максимальное количество игроков
	uint public allSteps;          // Общее количество игроков
	uint public timeStartGame;     // Отметка времени - начало игры
	uint public timeEndGame;       // Отметка времени - конец игры

	constructor(address _target) public {
		require(_target != address(0), "Empty address");
		// require(_target.delegatecall(bytes4(keccak256("initialize()"))),"Initialize target contract");
		targetContract = _target;
		// TargetProxy tp = TargetProxy(_target);
	}

	function() public payable {
		delegate();
	}

	function delegate() private {
		address target = targetContract;

		assembly {
			let ptr := mload(0x40)
			calldatacopy(ptr, 0, calldatasize)
			let success := delegatecall(gas, target, ptr, calldatasize, 0, 0)
			let size := returndatasize 
			returndatacopy(ptr, 0, size)
			switch success
			case 0 { revert(ptr, 32) }
			default { return(ptr, 32) }
		}
	}

}