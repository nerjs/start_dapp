const checkOwned = require('./custom/owned')

const AddrArr = artifacts.require('AddrArrLibTest')



contract('AddrArrLibTest', accounts => {
	it('Проверка тестового контракта', async () => {
		const arr = await AddrArr.deployed();
		const count = await arr.getCount();
		const list = await arr.getList();


		assert.equal(accounts.length, count.toNumber(), 'Количество аддресов совпадает');
		assert.equal(accounts.toString(), list.toString(), 'Массивы совпадают')
	})
})