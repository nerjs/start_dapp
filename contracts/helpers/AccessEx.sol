pragma solidity ^0.4.24;

import "./Owned.sol"; 
import "../libs/AddrArr.sol";


contract AccessEx is Owned {
	using AddrArr for *;
	address[] private _exceptions;

	event AddAccess(address target);
	event RemoveAccess(address target); 

	modifier onlyAccess() {
		require(_exceptions.indexOf(msg.sender) != uint(-1) , "Access denied");
		_;
	}

	function setAccess(address target) public onlyOwner {
		require(target != address(0), "Empty address");
		require(_exceptions.indexOf(target) != uint(-1), "Unnecessary changes");
		_exceptions.push(target);
	}

	function removeAccess(address target) public onlyOwner {
		require(target != address(0), "Empty address");
		require(_exceptions.indexOf(target) == uint(-1), "Unnecessary changes");
		_exceptions.remove(target);
	}
}