pragma solidity ^0.4.24;


interface IGameBase {
	function setInfoDataTest(uint _timeOut, uint _confirmTimeOut, uint _maxPlayers) external;
	function targetContract() external view returns(address);
	function timeOut() external view returns(uint);
	function confirmTimeOut() external view returns(uint);
	function maxPlayers() external view returns(uint);

}