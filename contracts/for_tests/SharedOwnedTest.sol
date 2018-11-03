pragma solidity ^0.4.24;

import "../helpers/SharedOwned.sol";

contract SharedOwnedTest is SharedOwned {
    uint private _test;

    function testOwner() public onlyOwner {
        _test = block.timestamp;
    }
}
