pragma solidity ^0.4.24;

import "../helpers/Owned.sol";


contract OwnedTest is Owned {
    uint private _test;

    function testOwner() public onlyOwner {
        _test = block.timestamp;
    }
}
