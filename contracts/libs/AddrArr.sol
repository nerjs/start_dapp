pragma solidity ^0.4.24; 


library AddrArr {

	/**
	* indexOf(address)
	* Позиция в списке либо uint(-1)
	*/
	function indexOf(address[] storage self, address item) public view returns(uint) {
		for (uint i = 0; i < self.length; i++) {
			if (self[i] == item) return i;
		}
		return uint(-1);
	}


	
	/**
	* @return Следующий аддресс относительно указанного или address(0)
	 */
	function next(address[] storage self, address item) public view returns(address) {
		uint index = indexOf(self, item);
		if (index == uint(-1) || index == (self.length - 1)) return address(0);
		return self[(index + 1)];
	}

	
	/**
	* @return Следующий аддресс относительно указанного или первый в списке (если указан reload)
	 */
	function next(address[] storage self, address item, bool reload) public view returns(address) {
		address n = next(self, item);
		if (n != address(0)) return n;
		return reload ? self[0] : n;
	}

	/**
	* @return Предыдущий аддресс относительно указанного или address(0)
	 */
	function prev(address[] storage self, address item) public view returns(address) {
		uint index = indexOf(self, item);
		if (index == 0 || index == uint(-1)) return address(0);
		return self[(index - 1)];
	}

	
	/**
	* @return Предыдущий аддресс относительно указанного или последний в списке (если указан reload)
	 */
	function prev(address[] storage self, address item, bool reload) public view returns(address) {
		address p = prev(self, item);
		if (p != address(0)) return p;
		return reload ? self[(self.length - 1)] : p;
	}


	/**
	* push(address) 
	* добавление в конец списка
	*/

	// function push(address[] storage self, address item) public returns(address[]) {
	// 	self[self.length] = item; 
	// 	return self; 
	// }

	/**
	* pop()
	* Удаляет последний элемент массива
	 */
	function pop(address[] storage self) public returns(uint) {
		self.length--;
		return self.length;
	} 

	/**
	* splice(uint start, uint count)
	* Удаление со здвигом
	* Удаляет элементы с сохранением порядка индексов
	* Удаляет элементы с позиции start в количестве count.
	* Сдвигает все оставшиеся и меняет длинну массива
	 */
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
			self.length = start; 
		} else {
			self.length -= count; 
		}

		return self.length; 
	}

	/**
	* remove(uint)
	* Удаляет элемент по индексу без сохранения порядка индексов
	* Заменяет Указанный элемент последним в списке и уменьшает длинну массива на 1
	 */
	function remove(address[] storage self, uint index) public returns(uint) {
		if (index >= self.length) return self.length;
		self[index] = self[(self.length - 1)];
		self.length -= 1;
		return self.length;
	}


	/**
	* remove(address)
	* Удаляет элемент по значению без сохранения порядка индексов
	* Заменяет Указанный элемент последним в списке и уменьшает длинну массива на 1
	 */
	function remove(address[] storage self, address item) public returns(uint) {
		uint index = indexOf(self, item);
		if (index == uint(-1)) return self.length;
		return remove(self, index);
	}


	/**
	* insert(uint startIndex, address[])
	* Вставка массива со здвигом
	* Вставляет переданный массив в исходный начиная с указанной позиции.
	* Сдвигает оставшиеся элементы в конец.
	* self = [1, 2, 3, 4];
	* self.insert(2, [5, 6, 7]);
	* self == [1, 2, 5, 6, 7, 3, 4];
	* Если стартовый индекс больше длинны массива - он считается равным длинне массива
	 */
	function insert(address[] storage self, uint startIndex, address[] items) public returns(uint) {
		if (items.length == 0) return self.length;
		if (startIndex > self.length) {
			startIndex = self.length;
		}

		uint i;
		address[] memory testAddr = new address[](self.length - startIndex);

		self.length += items.length;
		for (i = startIndex; i < self.length; i++) {
			if (self[i] != address(0)) {
				testAddr[(i - startIndex)] = self[i];
			}

			if ((i - startIndex) < items.length) {
				self[i] = items[(i - startIndex)];
			}
		}

		for (i = 0; i < testAddr.length; i++) {
			self[(i + startIndex + items.length)] = testAddr[i];
		}


		// for (i = (self.length - 1); i >= startIndex; i--) {
		// 	self[(i + items.length)] = self[i];
		// }

		// for (i = 0; i < items.length; i++) {
		// 	self[(i + startIndex)] = items[i];
		// }
		return self.length;
	}



	/**
	* insert(uint startIndex, address)
	* Вставка элемента со здвигом
	* Вставляет переданный элемент в исходный на указанную позицию.
	* Сдвигает оставшиеся элементы в конец.
	* self = [1, 2, 3, 4];
	* self.insert(2, 5);
	* self == [1, 2, 5, 3, 4];
	* Если стартовый индекс больше длинны массива - он считается равным длинне массива
	 */

	function insert(address[] storage self, uint index, address item) public returns(uint) {
		address[] memory items = new address[](1);
		items[0] = item;
		return insert(self, index, items);
	}


	/**
	* replace(uint startIndex, address)
	* Вставка элемента с заменой
	* Заменяет элемент на указанную позицию
	* Не сдвигает элементы
	* self = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	* self.replace(4, 9);
	* self == [0, 1, 2, 3, 9, 5, 6, 7? 8];
	* Если индекс больше длинны массива - он считается равным длинне массива
	 */
	function replace(address[] storage self, uint index, address item) public returns(uint) {
		if (index >= self.length) {
			self.push(item);
			return self.length;
		}

		self[index] = item;

		return self.length;
	}

	/**
	* replace(uint startIndex, address[])
	* Вставка элементов с заменой
	* Заменяет элемент на указанную позицию
	* Не сдвигает элементы
	* self = [0, 1, 2, 3, 4, 5, 6, 7, 8];
	* self.replace(4, [9, 10, 11]);
	* self == [0, 1, 2, 3, 9, 5, 6, 7? 8];
	* Если стартовый индекс больше длинны массива - он считается равным длинне массива
	 */
	function replace(address[] storage self, uint startIndex, address[] items) public returns(uint) {
		if (items.length == 0) return self.length;
		if (startIndex > self.length) {
			startIndex = self.length;
		}

		uint d = startIndex + items.length;

		if (d > self.length) {
			self.length = d;
		}

		for (uint i = startIndex; i < d; i++) {
			self[i] = items[(i - startIndex)];
		}

		return self.length;
	}

	function shift(address[] storage self) public returns(uint) {
		if (self.length == 0) return 0;
		return splice(self, 0, 1);
	} 

	function unshift(address[] storage self, address item) public returns(uint) {
		if (self.length == 0) {
			self.push(item);
			return 1;
		}

		return insert(self, 0, item);
	}


}