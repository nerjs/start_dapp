const et = require('../utils/error_tests')

const Game = artifacts.require('Game')


contract('Game', accounts => {

    it('Проверка доступа', async () => {
        const game = await Game.new(accounts[1], accounts[2], true)

        const playerX = await game.playerX();
        const player0 = await game.player0();
        const next = await game.next();

        assert.equal(playerX, accounts[1], 'Установка первого игрока')
        assert.equal(player0, accounts[2], 'Установка второго игрока')
        assert.equal(next, true, 'Установка следующего хода')
    })



    it('Одинаковые адресса', async () => {
        await et(false,()=>Game.new(accounts[2],accounts[2],false), 'Пропускает одинаковые адресса в конструкторе')
    })


})
