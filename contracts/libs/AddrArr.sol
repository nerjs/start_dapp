pragma solidity ^0.4.24; 


library AddrArr {

	function indexOf(address[] storage self, address item) view public returns(uint) {
		for (uint i = 0; i < self.length; i++) {
			if (self[i] == item) return i;
		}
		return uint(-1);
	}



	// function push(address[] storage self, address item) public returns(address[]) {
	// 	self[self.length] = item; 
	// 	return self; 
	// }

	function pop(address[] storage self) public returns(uint) {
		self.length--;
		return self.length;
	} 

	function splice(address[] storage self, uint start, uint count) public returns(uint) {
		if (self.length < start) return self.length; 
		if (self.length < count && start == 0) {
			self.length = 0; 
			return 0; 
		}
		

		for (uint i = start; i < self.length; i++) {
			if ((i + count) < self.length) {
				self[i] = self[(i + count)];
			}
		}

		if ((start + count) > self.length) {
			self.length = start + 1; 
		} else {
			self.length -= count; 
		}

		return self.length; 
	}


}