const et = require('../utils/error_tests')

const SharedOwner = artifacts.require('SharedOwner')


contract('SharedOwner', accounts => {

    it('Проверка доступа', async () => {
        const so = await SharedOwner.deployed();

        await et(true, ()=>so.transferOwner(accounts[1], { from: accounts[0] }), 'Изменение первым акк. [ Ok ]')
        await et(false, ()=>so.transferOwner(accounts[3], { from: accounts[4] }), 'Изменение другим акк. [ Error ]')
        await et(false, ()=>so.confirmOwner({ from: accounts[2] }), 'Подтверждение другим акк. [ Error ]')
        await et(true, ()=>so.confirmOwner({ from: accounts[1] }), 'Подтверждение правильным акк. [ Ok ]')

    })


})