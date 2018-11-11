pragma solidity ^0.4.24;

import "../libs/AddrArr.sol";
import "../helpers/Owned.sol";


contract GameBase is Owned {
	using AddrArr for *;

	address[] public players;
}