pragma solidity ^0.4.2;


contract Test {
    uint public test;
    constructor() public {
        test = 1;
    }

    function testError(uint8 t) public {
        require(t != test, "not test var");
        test = t;
    }

    function testRequire() view public returns(bool) {
        require(false, "test require");
        return true;
    }

    function testAssert() view public returns(bool) {
        assert(false);
        return true;
    }
}