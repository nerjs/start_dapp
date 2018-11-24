require('colors')
const lh = require('./helpers/list')
const address = require('./helpers/address')
const AddrArr = artifacts.require('AddrArrLibTest')



contract('AddrArrLibTest', accounts => {
	const parseList = async (arr, count) => {
		const _list1 = await arr.getList();
		await arr.splice(_list1.length - count, count * 2);
		const list1 = await arr.getList();
		const list2 = [];

		_list1.forEach(addr => {
			if (list1.indexOf(addr) < 0) {
				list2.push(addr)
			}
		})

		return [list1, list2];
	}

	const updateList = async arr => {
		await arr.splice(0, accounts.length * 2);
		for (let i = 0; i < accounts.length; i++) {
			await arr.push(accounts[i]);
		}
	}



	it('Проверка тестового контракта', async () => {
		console.log('library'.blue, 'AddrArr'.yellow, '/libs/AddrArr.sol'.green)
		const arr = await AddrArr.deployed();
		const count = await arr.getCount();
		const list = await arr.getList();


		assert.equal(accounts.length, count.toNumber(), 'Количество аддресов совпадает');
		lh.equal(accounts, list, 'Массивы совпадают')
	})

	it('Получение информации [indexOf(item)]', async () => {
		const arr = await AddrArr.deployed();
		const list = await arr.getList();
		const indexOf1 = await arr.indexOf(arr.address);
		const indexOf2 = await arr.indexOf(list[3]);
		assert(!indexOf1[0], 'Аддреса контракта нет в списке');
		assert(indexOf2[0], 'Необходимый аддресс найден в списке');
		assert.equal(indexOf2[1].toNumber(), 3, 'Позиции необходимого аддресса совпадают');
	})

	it('Добавление и удаление элементов с конца списка', async () => {
		const arr = await AddrArr.deployed();
		const list1 = await arr.getList();
		let indexOf = [];
		
		await arr.push(arr.address);

		const list2 = await arr.getList();
		indexOf = await arr.indexOf(arr.address);
		
		assert.equal(list1.length + 1, list2.length, 'Длинна массива увеличилась');
		assert.equal(list2[list1.length], arr.address, 'Добавленный аддресс присутствует в списке');
		assert(indexOf[0], 'Добавленный аддресс найден в списке [indexOf()]');
		assert.equal(list1.length, indexOf[1], 'Позиция найденного аддресса совпадает [indexOf()}');

		await arr.pop();

		const list3 = await arr.getList();
		indexOf = await arr.indexOf(arr.address);
		
		assert.equal(list2.length - 1, list3.length, 'Длинна массива уменьшилась');
		lh.notInList(list3, arr.address, 'Удаленный аддресс отсутствует в списке');
		assert(!indexOf[0], 'Удаленный аддресс не найден в списке [indexOf()]');
	});

	it('Удаление со здвигом', async () => {
		const arr = await AddrArr.deployed();
		const list1 = await arr.getList();

		const start = parseInt(list1.length / 4),
			count = parseInt(list1.length / 3);

		await arr.splice(start, count);
		
		const list2 = await arr.getList();
		const io1 = await arr.indexOf(list1[start])
		const io2 = await arr.indexOf(list1[start + count - 1])
		assert.equal(list2.length, list1.length - count, 'Длинна массива изменилась');
		assert(!io1[0], 'Первый удаленный аддресс не найден [.sol]');
		assert(!io2[0], 'Последний удаленный аддресс не найден [.sol]');
		assert.equal(list2.indexOf(list1[start]), -1, 'Первый удаленный аддресс не найден [.js]');
		assert.equal(list2.indexOf(list1[count]), -1, 'Последний удаленный аддресс не найден [.js]');

		list1.splice(start, count);
		
		list1.forEach((addr, i) => {
			assert.equal(addr, list2[i], `Проверка в результатах [index:${i}]`);
		})


		await arr.splice(list2.length - count, count * 2);

		const list3 = await arr.getList();


		list2.forEach((addr, i) => {
			if (i < (list2.length - count)) {
				assert.equal(list3[i], addr, `Оставшиеся элементы совпадают [index:${i}]`);
			} else {
				assert(!list3[i], `Удаленные элементы отсутствуют [index:${i}]`);
			}
		})

		await arr.splice(0, list1.length);

		const list4 = await arr.getList();

		assert.equal(list4.length, 0, 'Подное удаление списка');


		await updateList(arr);
	});

	it('Удаление без сохранения порядка', async () => {
		const arr = await AddrArr.deployed();
		const list1 = await arr.getList();
		
		const removeAddr = list1[3],
			removeId = 5;


		await arr.remove(removeAddr);
		const list2 = await arr.getList();

		assert.equal(list2.length, list1.length - 1, 'длинна массива уменьшилась [remove()]');
		assert.equal(list2.indexOf(removeAddr), -1, 'Удаленный элемент не найден в списке [remove()]');

		const removeAddr2 = list2[removeId];
		await arr.removeIndex(removeId);
		const list3 = await arr.getList();

		assert.equal(list3.length, list2.length - 1, 'длинна массива уменьшилась [removeIndex()]');
		assert.equal(list3.indexOf(removeAddr2), -1, 'Удаленный элемент не найден в списке [removeIndex()]');

		await updateList(arr);
	});

	it('Добавление элемента со здвигом', async () => {
		const arr = await AddrArr.deployed();
		const list = await arr.getList();
		const index = 4;

		
		await arr.insertItem(index, arr.address)
		const list2 = await arr.getList();

		assert.equal(list2.length, list.length + 1, 'Длинна массива увеличилась на 1');
		lh.inList(list2, arr.address, 'insert item')
		await updateList(arr);
	});

	it('Добавление массива со здвигом', async () => {
		const arr = await AddrArr.deployed();
		const [ list1, list2 ] = await parseList(arr, 4);
		const start = parseInt(list1.length / 2)

		await arr.insert(start, list2);
		const list3 = await arr.getList();

		assert.equal(list3.length, list1.length + list2.length, 'Правильный новый размер массива');

		list3.forEach((addr, i) => {
			if (i < start) {
				assert.equal(addr, list1[i], `Элементы до стартовой позиции не изменились [index:${i}]`);
			} else if (i >= start && i < (start + list2.length)) {
				assert.equal(addr, list2[(i - start)], `Элементы после стартовой позиции в пределах вставляемого массива соответствуют [index:${i}]`);
			} else {
				assert.equal(addr, list1[(i - list2.length)], `Элементы после вставляемого списка соответствут ожидаемым [index:${i}]`);
			}
		})




		await updateList(arr);
	});

	it('Добавление с заменой', async () => {
		const arr = await AddrArr.deployed();
		const [ list1, list2 ] = await parseList(arr, 3)
		const start1 = list1.length - 2,
			start2 = list1.length - 5;
		await arr.replace(start1, arr.address);
		const list3 = await arr.getList();
		assert.equal(list3.length, list1.length, 'Длинна массива, при одиночной вставке, не изменилась');
		assert.equal(list3[start1], arr.address, 'В необходимой позиции ожидаемый элемент');

		await arr.replaceArr(start2, list2);
		const list4 = await arr.getList();
		assert.equal(list4.length, list1.length, 'Длинна массива, при вставке vfccbdf, не изменилась');

		list4.forEach((addr, i) => {
			if (i >= start2 && i < start2 + list2.length) {
				assert.equal(addr, list2[( i - start2 )], `1) Элементы внутри вставляемого списка соответствуют ожидаемым [index:${i}]`);
			} else {
				assert.equal(addr, list3[i], `1) Элементы вне вставляемого списка остались на месте [index:${i}]`);
			}
		})

		await updateList(arr);
		const [list5, list6 ] = await parseList(arr, 5);
		const start3 = list5.length - 3;
		
		await arr.replaceArr(start3, list6);
		const list7 = await arr.getList();

		assert.equal(list7.length, start3 + list6.length, 'Длинна массива, при вставке массива, соответствует необходимой длинне');

		list7.forEach((addr, i) => {
			if (i >= start3) {
				assert.equal(addr, list6[( i - start3 )], `2) Элементы внутри вставляемого списка соответствуют ожидаемым [index:${i}]`);
			} else {
				assert.equal(addr, list5[i], `2) Элементы вне вставляемого списка остались на месте [index:${i}]`);
			}
		})
		await updateList(arr);
	});

	it('Добавление у удаление с начала списка', async () => {
		const arr = await AddrArr.deployed();
		const list1 = await arr.getList();

		await arr.shift();
		const list2 = await arr.getList();

		assert.equal(list2.length, list1.length - 1, 'Длинна массива после удаления первого элемента уменьшилась на 1');
		assert.notEqual(list2[0], list1[0], 'Первый элемент не соответствует предидущему значению');
		list1.shift();
		assert.equal(JSON.stringify(list2), JSON.stringify(list1), 'Порядок элементов после удаления соответствует');

		await arr.unshift(arr.address);
		const list3 = await arr.getList();

		assert.equal(list3.length, list2.length + 1, 'Длинна массива после добавления первого элемента увеличилась на 1');
		assert.notEqual(list3[0], list2[0], 'Первый элемент не соответствует предидущему значению');
		list2.unshift(arr.address);
		assert.equal(JSON.stringify(list3), JSON.stringify(list2), 'Порядок элементов после удаления соответствует');

		await updateList(arr);
	});

	it('Получение следующего и предыдущего элемента prev/next', async () => {
		const arr = await AddrArr.deployed();
		const list = await arr.getList();
		const last = list.length - 1;
		const next1 = await arr.next(list[last])
		const next2 = await arr.next(list[last - 1])
		const next3 = await arr.nextReload(list[last], true)
		const prev1 = await arr.prev(list[0])
		const prev2 = await arr.prev(list[1])
		const prev3 = await arr.prevReload(list[0], true)

		assert.equal(next1, address.ADDRESS, 'Следующий от последнего слота - пустой слот');
		assert.equal(next2, list[last], 'Следующий от предпоследнего слота - последний слот');
		assert.equal(next3, list[0], 'Следующий от последнего слота с параметром reload - первый слот');
		assert.equal(prev1, address.ADDRESS, 'Предидущий от первого слота - пустой слот');
		assert.equal(prev2, list[0], 'Предидущий от второго слота - первый слот');
		assert.equal(prev3, list[last], 'Предидущий от первого слота с параметром reload - последний слот');
	});
})