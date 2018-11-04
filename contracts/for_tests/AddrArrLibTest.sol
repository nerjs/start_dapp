pragma solidity ^0.4.24;

import "../libs/AddrArr.sol";

contract AddrArrLibTest {
	using AddrArr for address[];

	address[] private list;

	constructor(address[] _list) public {
		list = _list;
	}

	function getList() view public returns(address[]) {
		return list;
	}

	function getCount() view public returns(uint) {
		return list.length;
	}

	function indexOf(address item) view public returns(bool, uint) {
		uint res = list.indexOf(item);
		return (res != uint(-1), res);
	}

	function push(address item) public returns(uint) {
		return list.push(item);
	}

	function pop() public returns(uint) {
		return list.pop();
	}

	function splice(uint start, uint count) public {
		list.splice(start, count);
	}
}