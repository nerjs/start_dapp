pragma solidity ^0.4.24;

import "../libs/AddrArr.sol";

contract AddrArrLibTest {
	using AddrArr for address[];

	address[] private _list;

	constructor(address[] __list) public {
		_list = __list;
	}

	function getList() view public returns(address[]) {
		return _list;
	}

	function getCount() view public returns(uint) {
		return _list.length;
	}
}