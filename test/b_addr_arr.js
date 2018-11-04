require('colors')
const AddrArr = artifacts.require('AddrArrLibTest')



contract('AddrArrLibTest', accounts => {
	it('Проверка тестового контракта', async () => {
		console.log('library'.blue, 'AddrArr'.yellow, '/libs/AddrArr.sol'.green)
		const arr = await AddrArr.deployed();
		const count = await arr.getCount();
		const list = await arr.getList();


		assert.equal(accounts.length, count.toNumber(), 'Количество аддресов совпадает');
		assert.equal(accounts.toString(), list.toString(), 'Массивы совпадают')
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
		assert.equal(list3.indexOf(arr.address), -1, 'Удаленный аддресс отсутствует в списке');
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
			assert.equal(addr, list2[i], `Проверка в результатах [${i}]`);
		})
	});

	it('Удаление без сохранения порядка', async () => {
		
	});

	it('Добавление со здвигом', async () => {
		
	});

	it('Добавление с заменой', async () => {
		
	});

	it('Добавление у удаление с начала списка', async () => {
		
	});
})