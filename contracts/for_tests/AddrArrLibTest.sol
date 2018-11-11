pragma solidity ^0.4.24;

import "../libs/AddrArr.sol";


contract AddrArrLibTest {
	using AddrArr for address[];

	address[] private list;

	constructor(address[] _list) public {
		list = _list;
	}

	function getList() public view returns(address[]) {
		return list;
	}

	function getCount() public view returns(uint) {
		return list.length;
	}

	function indexOf(address item) public view returns(bool, uint) {
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

	function remove(address item) public {
		list.remove(item);
	}

	function removeIndex(uint index) public {
		list.remove(index);
	}

	function insert(uint index, address[] items) public {
		list.insert(index, items);
	}

	function insertItem(uint index, address item) public {
		list.insert(index, item);
	}

	function replace(uint index, address item) public {
		list.replace(index, item);
	}
	function replaceArr(uint start, address[] items) public {
		list.replace(start, items);
	}

	function shift() public {
		list.shift();
	}

	function unshift(address item) public {
		list.unshift(item);
	}
}