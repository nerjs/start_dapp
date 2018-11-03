pragma solidity ^0.4.24;


library AddrArr {
	function push(address[] storage self, address item) public returns(uint) {
		self[self.length] = item;
		return self.length;
	}

	function slice(address[] storage self, uint index, uint count) public returns(uint) {
		if (self.length < index) return self.length;
		if (self.length < count && index == 0) {
			self.length = 0;
			return 0;
		}

		for (uint i = 0; i < self.length; i++) {
			if (i >= index) {
				if (self[i + count] != address(0)) {
					self[i] = self[i + count];
				}
			}
		}

		if ((index + count) > self.length) {
			self.length = index + 1;
		} else {
			self.length -= count;
		}

		return self.length;
	}


}