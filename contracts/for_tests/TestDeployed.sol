pragma solidity ^0.4.24;

import "../base/GameBase.sol";
import "./AddrArrLibTest.sol";


contract TestDeployed {
	address public test;

	function gameBase() public {
		GameBase gb = new GameBase();
		test = address(gb);
	}

	function addrArr() public {
		address[] memory arr;
		AddrArrLibTest gb = new AddrArrLibTest(arr);
		test = address(gb);
	}
}