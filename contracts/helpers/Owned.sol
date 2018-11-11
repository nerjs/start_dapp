pragma solidity ^0.4.24;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */

contract Owned {
    address internal _owner;

    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    constructor() public {
        _owner = msg.sender;
    }

  /**
   * @return the address of the owner.
   */

    function owner() public view returns(address) {
        return _owner;
    }

  /**
   * @dev Throws if called by any account other than the owner.
   */
    modifier onlyOwner() {
        require(isOwner(), "Access is denied");
        _;
    }

  /**
   * @return true if `msg.sender` is the owner of the contract.
   */
    function isOwner() public view returns(bool) {
        return msg.sender == _owner;
    }
}