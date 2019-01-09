pragma solidity ^0.4.24;


import "../base/Proxy.sol";


contract ProxyDeployer {
	address public target;
	address public lastProxy;
	constructor(address _target) public {
		target = _target;
	}

	function dep() public {
		lastProxy = address(new Proxy3(target));
	}
}