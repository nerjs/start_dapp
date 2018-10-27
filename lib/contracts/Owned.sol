pragma solidity ^0.4.2;

contract Owned {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "only Owner");
        _;
    }
}


contract SharedOwner is Owned {
    address public newOwner;

       
    function transferOwner(address _newOwner) public onlyOwner {
        newOwner = _newOwner;
    }
    
    function confirmOwner() public {
        require(newOwner == msg.sender);

        owner = msg.sender;
    } 
}
