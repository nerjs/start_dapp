const et = require('../helpers/error_tests');
const checkEvents = require('../helpers/check_events')
const addrUtil = require('../helpers//address')



module.exports = (Contract, accounts, shared) => {
	const acc1 = accounts[0],
		acc2 = accounts[1],
		acc3 = accounts[2],
		fromAcc = a => ({ from: a });

	it('Проверка прав доступа', async () => {
		const contract = await Contract.deployed();
		const isOwner1 = await contract.isOwner(fromAcc(acc1))
		const isOwner2 = await contract.isOwner(fromAcc(acc2))
		const owner = await contract.owner(fromAcc(acc2))

		assert(isOwner1, 'У первого пользователя должны быть права доступа');
		assert(!isOwner2, 'У второго пользователя не должно быть прав доступа');
		assert.equal(owner, acc1, 'Аддрес создателя контракта и владельца прав совпадают');
	});

	if (!shared) return;

    it('Передача прав доступа ', async () => {
        let owner, isOwner;

        const contract = await Contract.deployed();
        
        await et(false, () => contract.transferOwner(acc2, fromAcc(acc3)), 'У второго АКК нет прав')
        await et(true, () => contract.transferOwner(acc2, fromAcc(acc1)), 'У первого АКК есть права')

        
        owner = await contract.owner();
        assert.equal(owner, acc1, '[Owner] по прежнему равен первому АКК')

        await et(false, ()=>contract.confirmOwner(fromAcc(acc3)), 'Подтверждение от неправильного пользователя');

        const tx = await contract.confirmOwner(fromAcc(acc2));

        checkEvents(tx, 'TransferredOwner', 1, {
            previousOwner: acc1,
            newOwner: acc2
        });

        owner = await contract.owner();
        isOwner = await contract.isOwner(fromAcc(acc2));

        assert.equal(owner, acc2, '[Owner] равен второму АКК');
        assert(isOwner, '[Owner] равен второму АКК');


        isOwner = await contract.isOwner(fromAcc(acc1));
        assert(!isOwner, '[Owner] не равен первому АКК');

        await et(true, ()=>contract.transferOwner(acc3, fromAcc(acc2)), 'Передача прав третьему АКК')
        await et(true, ()=>contract.cancelOwner(fromAcc(acc2)), 'Отмена передачи прав')
        await et(false, ()=>contract.confirmOwner(fromAcc(acc3)), 'Подтвердить передачу прав невозможно')

        await et(false, ()=>contract.transferOwner(addrUtil.ADDRESS, fromAcc(acc2)), 'Передача прав невозможна с пустым аддресом')
        
    })

    
}