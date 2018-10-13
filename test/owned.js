const et = require('../utils/error_tests')

const SharedOwner = artifacts.require('SharedOwner')


contract('SharedOwner', accounts => {
    it('Проверка owned', async () => {
        const so = await SharedOwner.new({ from: accounts[1] })
        const owner = await so.owner();
        assert.equal(accounts[1], owner, 'Записи OWNER не одинаковые...')
    })

    it('Проверка доступа к стэйту', async () => {
        const so = await SharedOwner.deployed();
        const owner = await so.owner();

        assert.equal(owner, accounts[0], 'Owner не подходящий');


        await et(()=>so.transferOwner(accounts[3], {from: accounts[0]}),'ttt')


       
    })
})