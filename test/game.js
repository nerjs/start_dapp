const et = require('../utils/error_tests')
const { isEmptyAddress } = require('../utils/eth')

const Game = artifacts.require('Game')


contract('Game', accounts => {

    it('Запуск контракта', async () => {
        const game = await Game.new(accounts[1], accounts[2], true)

        const playerX = await game.playerX();
        const player0 = await game.player0();
        const next = await game.next();

        assert.equal(playerX, accounts[1], 'Установка первого игрока')
        assert.equal(player0, accounts[2], 'Установка второго игрока')
        assert.equal(next, true, 'Установка следующего хода')
    })

    it('Старт игры', async () => {
        let game = await Game.new(accounts[1], 0, true)
        let player1 = await game.playerX();
        let player2 = await game.player0();
        let ready = await game.ready();
        assert.equal(isEmptyAddress(player1), false, 'Первый аддресс игрока не должен быть пустым [address, 0, true]')
        assert.equal(isEmptyAddress(player2), true, 'Второй аддресс игрока должен быть пустым [address, 0, true]')
        assert.equal(ready, false, 'Игра не должнабыть готова к старту вначале [address, 0, true]')
        assert.equal(accounts[1], player1, 'Первого игрока ставит в неправильную позицию [address, 0, true]')



        game = await Game.new(accounts[1], 0, false)
        player1 = await game.playerX();
        player2 = await game.player0();
        ready = await game.ready();
        assert.equal(isEmptyAddress(player1), true, 'Первый аддресс игрока должен быть пустым [address, 0, false]')
        assert.equal(isEmptyAddress(player2), false, 'Второй аддресс игрока не должен быть пустым [address, 0, false]')
        assert.equal(ready, false, 'Игра не должнабыть готова к старту вначале [address, 0, false]')
        assert.equal(accounts[1], player2, 'Первого игрока ставит в неправильную позицию [address, 0, false]')



        game = await Game.new(accounts[1], accounts[2], true)
        player1 = await game.playerX();
        player2 = await game.player0();
        ready = await game.ready();
        assert.equal(ready, false, 'Игра не должнабыть готова к старту вначале [address, address, true]')
        assert.equal(accounts[1], player1, 'Первого игрока ставит в неправильную позицию [address, address, true]')
        assert.equal(accounts[2], player2, 'Второго игрока ставит в неправильную позицию [address, address, true]')


        game = await Game.new(accounts[1], accounts[2], false)
        player1 = await game.playerX();
        player2 = await game.player0();
        ready = await game.ready();
        assert.equal(ready, false, 'Игра не должнабыть готова к старту вначале [address, address, false]')
        assert.equal(accounts[1], player2, 'Первого игрока ставит в неправильную позицию [address, address, false]')
        assert.equal(accounts[2], player1, 'Второго игрока ставит в неправильную позицию [address, address, false]')
    })



    it('Одинаковые адресса', async () => {
        await et(false,()=>Game.new(accounts[2],accounts[2],false), 'Пропускает одинаковые адресса в конструкторе')
    })

    it('Проверка полей при старте', async () => {
        const game = await Game.new(accounts[1], accounts[2], true)
        const fields = await game.getFields();


        assert.isArray(fields, 'Значение fields[getFields()] не массив');
        assert.equal(fields.length, 10, 'Длинна массива fields должна быть равна 10')
        fields.forEach( (f, i) => {
            assert.isFunction(f.toNumber, `Тип поля fields[${i}] не является числом(BigNumber)`);
            assert.equal(f.toNumber(), 0, `Значение поля fields[${i}] должно быть 0`)
        })

    })


    it('Игровой процесс. Проверка ошибок', async () => {
        const game = await Game.new(accounts[1], accounts[2], true)
        
        await et(false, ()=>game.confirmGame({ from: accounts[1]}),'Ошибка при подтверждении старта игры')
        await et(true, ()=>game.confirmGame({ from: accounts[2]}),'Отсутствие ошибки при подтверждении старта игры')

        await et(false, ()=>game.step(3,{ from: accounts[3] }), 'Акк, отличный от игроков')
        await et(false, ()=>game.step(10, { from: accounts[1] }), 'Переданное число больше чем необходимо')
        await et(false, ()=>game.step(0, { from: accounts[1] }), 'Переданное число меньше чем необходимо')

        await et(false, ()=>game.step(3, { from: accounts[2]}),'Ход вне очереди [1]')
        await et(true, ()=>game.step(3, { from: accounts[1]}),'Ход согласно очереди [1]')

        await et(false, ()=>game.step(3,{ from: accounts[2] }), 'Повторная передача одного и того же параметра')

        await et(false, ()=>game.step(4, { from: accounts[1]}),'Ход вне очереди [2]')
        await et(true, ()=>game.step(4, { from: accounts[2]}),'Ход согласно очереди [2]')


    })


    it('Игровой процесс. Проверка результатов', async () => {
        const px = accounts[1],
            p0 = accounts[2];

        let prev;


        const game = await Game.new(px, p0, true);
        await game.confirmGame({ from: p0 })
        
        prev = await game.fields(2);
        assert.equal(prev.toNumber(), 0, 'Пустое поле перед ходом')
        await game.step(2, { from: px});
        prev = await game.fields(2);
        assert.equal(prev.toNumber(), 1, 'Подтверждение первого хода')

        prev = await game.fields(5);
        assert.equal(prev.toNumber(), 0, 'Пустое поле перед ходом')
        await game.step(5, { from: p0});
        prev = await game.fields(5);
        assert.equal(prev.toNumber(), 2, 'Подтверждение второго хода')

        prev = await game.fields(4);
        assert.equal(prev.toNumber(), 0, 'Пустое поле перед ходом')
        await game.step(4, { from: px});
        prev = await game.fields(4);
        assert.equal(prev.toNumber(), 1, 'Подтверждение третьего хода')


    })

})
