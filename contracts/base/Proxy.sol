pragma solidity ^0.4.24;


import "../interfaces/TargetProxy.sol";


contract Proxy {
	

	function() public payable {
		address t = implementation();

		assembly {
			let ptr := mload(0x40)
			calldatacopy(ptr, 0, calldatasize)
			let success := delegatecall(gas, t, ptr, calldatasize, 0, 0)
			let size := returndatasize 
			returndatacopy(ptr, 0, size)
			switch success
			case 0 { revert(ptr, 32) }
			default { return(ptr, 32) }
		}
	}

	function implementation() public view returns (address);




}


contract Proxy2 {

	function() public payable {

        address addr = implementation();
        
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize)
            let success := delegatecall(gas, addr, ptr, calldatasize, 0, 0)
            let size := returndatasize
            returndatacopy(ptr, 0, size)switch success
            case 0 { revert(ptr, 32) }
            default { return(ptr, 32) }
        }
	}

	function implementation() public view returns (address);
}


contract Proxy3 is Proxy2 {

    address private __target;
	uint public timeOut = 0;           // Допустимая задержка времени между ходами
	uint public confirmTimeOut = 0;    // Допустимая задержка времени перед подтверждением участия
	uint public maxPlayers = 0;        // Максимальное количество игроков

    constructor(address _target) public {
        __target = _target;
		TargetProxy tp = TargetProxy(_target);
		tp.initialize();
    }
	function implementation() public view returns (address) {
		return address(__target);
	}
}
