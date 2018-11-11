const et = require('../utils/error_tests')
const { isEmptyAddress } = require('../utils/eth')
const {
    FIELD_STATUS_EMPTY,
    FIELD_STATUS_X,
    FIELD_STATUS_0,

    GAME_STATUS_WAITING,
    GAME_STATUS_CONFIRM_WAITING,
    GAME_STATUS_STEP_WAITING,
    GAME_STATUS_GAME_STARTED,
    GAME_STATUS_REMOVE_FIRST_PLAYER,
    GAME_STATUS_LONG_WAITING,
    GAME_STATUS_CAPITULATE,
    GAME_STATUS_WIN
} = require('../utils/constants')

const Game = artifacts.require('Game')

const contract1 = ()=>{}

contract1('Game', accounts => {

    it('Запуск контракта', async () => {
        const game = await Game.new(accounts[1], accounts[2], true, 1000, 0)

        const playerX = await game.playerX();
        const player0 = await game.player0();
        const next = await game.next();

        assert.equal(playerX, accounts[1], 'Установка первого игрока')
        assert.equal(player0, accounts[2], 'Установка второго игрока')
        assert.equal(next, true, 'Установка следующего хода')
    })

    it('Старт игры', async () => {
        let game = await Game.new(accounts[1], 0, true, 1000, 0)
        let player1 = await game.playerX();
        let player2 = await game.player0();
        let ready = await game.ready();
        assert.equal(isEmptyAddress(player1), false, 'Первый аддресс игрока не должен быть пустым [address, 0, true]')
        assert.equal(isEmptyAddress(player2), true, 'Второй аддресс игрока должен быть пустым [address, 0, true]')
        assert.equal(ready, false, 'Игра не должнабыть готова к старту вначале [address, 0, true]')
        assert.equal(accounts[1], player1, 'Первого игрока ставит в неправильную позицию [address, 0, true]')



        game = await Game.new(accounts[1], 0, false, 1000, 0)
        player1 = await game.playerX();
        player2 = await game.player0();
        ready = await game.ready();
        assert.equal(isEmptyAddress(player1), true, 'Первый аддресс игрока должен быть пустым [address, 0, false]')
        assert.equal(isEmptyAddress(player2), false, 'Второй аддресс игрока не должен быть пустым [address, 0, false]')
        assert.equal(ready, false, 'Игра не должнабыть готова к старту вначале [address, 0, false]')
        assert.equal(accounts[1], player2, 'Первого игрока ставит в неправильную позицию [address, 0, false]')



        game = await Game.new(accounts[1], accounts[2], true, 1000, 0)
        player1 = await game.playerX();
        player2 = await game.player0();
        ready = await game.ready();
        assert.equal(ready, false, 'Игра не должнабыть готова к старту вначале [address, address, true]')
        assert.equal(accounts[1], player1, 'Первого игрока ставит в неправильную позицию [address, address, true]')
        assert.equal(accounts[2], player2, 'Второго игрока ставит в неправильную позицию [address, address, true]')


        game = await Game.new(accounts[1], accounts[2], false, 1000, 0)
        player1 = await game.playerX();
        player2 = await game.player0();
        ready = await game.ready();
        assert.equal(ready, false, 'Игра не должнабыть готова к старту вначале [address, address, false]')
        assert.equal(accounts[1], player2, 'Первого игрока ставит в неправильную позицию [address, address, false]')
        assert.equal(accounts[2], player1, 'Второго игрока ставит в неправильную позицию [address, address, false]')
    })



    it('Одинаковые адресса', async () => {
        await et(false,()=>Game.new(accounts[2],accounts[2],false, 1000, 0), 'Пропускает одинаковые адресса в конструкторе')
    })

    it('Проверка полей при старте', async () => {
        const game = await Game.new(accounts[1], accounts[2], true, 1500, accounts[3])
        const fields = await game.getFields();
        const maxWait = await game.maxWait();
        await game.confirmGame({ from: accounts[2] })
        const st = parseInt(Date.now() / 10000);
        const startTime = await game.startTime()

        assert.isArray(fields, 'Значение fields[getFields()] не массив');
        assert.equal(fields.length, 10, 'Длинна массива fields должна быть равна 10')
        fields.forEach( (f, i) => {
            assert.isFunction(f.toNumber, `Тип поля fields[${i}] не является числом(BigNumber)`);
            assert.equal(f.toNumber(), FIELD_STATUS_EMPTY, `Значение поля fields[${i}] должно быть 0`)
        })

        assert.equal(maxWait.toNumber(), 1500, 'Максимальное ожидание в секундах')
        assert.equal(st, parseInt(startTime.toNumber()/10), 'Начало игры')
    })


    it('Игровой процесс. Проверка ошибок', async () => {
        const game = await Game.new(accounts[1], accounts[2], true, 1000, 0)
        
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


        const game = await Game.new(px, p0, true, 1000, 0);
        await game.confirmGame({ from: p0 })
        
        prev = await game.fields(2);
        assert.equal(prev.toNumber(), FIELD_STATUS_EMPTY, 'Пустое поле перед ходом')
        await game.step(2, { from: px});
        prev = await game.fields(2);
        assert.equal(prev.toNumber(), FIELD_STATUS_X, 'Подтверждение первого хода')

        prev = await game.fields(5);
        assert.equal(prev.toNumber(), FIELD_STATUS_EMPTY, 'Пустое поле перед ходом')
        await game.step(5, { from: p0});
        prev = await game.fields(5);
        assert.equal(prev.toNumber(), FIELD_STATUS_0, 'Подтверждение второго хода')

        prev = await game.fields(4);
        assert.equal(prev.toNumber(), FIELD_STATUS_EMPTY, 'Пустое поле перед ходом')
        await game.step(4, { from: px});
        prev = await game.fields(4);
        assert.equal(prev.toNumber(), FIELD_STATUS_X, 'Подтверждение третьего хода')


    })

    it('Игровой процесс. Определение победителя', async () => {
        const px = accounts[1],
            p0 = accounts[2];

        let prev;

        const checkWinner = async (n, s, g, type, _p) => {
            const r = await Promise.all([
                g.end(),
                g.winner(),
                g.playerX(),
                g.player0(),
                g.status(),
                g.getWinner()
            ])
            let _st;

            const p = r[1]? r[2] : r[3];

            assert.equal(r[0], r[5][0], 'Сравнение результата getWinner(end)')

            assert.equal(r[0], type, `Ошибочный результат. [Игра:${n}; Ход:${s}]` )

            if (r[0]) {
                assert.equal(p, _p, `Не тот победитель. [Игра:${n}; Ход:${s}]`)
                assert.equal(p, r[5][2], 'Сравнение результата getWinner(address _winner)')
                _st = r[1] ? 1 : 2;
                assert.equal(r[4].toNumber(), GAME_STATUS_WIN, 'Правильный статус при победе')
            }  else {
                _st = 0;
                assert.equal(r[4].toNumber(), GAME_STATUS_GAME_STARTED, 'Правильный статус по игре')
            }

            assert.equal(_st, r[5][1], 'Сравнение результата getWinner(status)')
            assert.equal(r[4].toNumber(), r[5][3].toNumber(), 'Сравнение результата getWinner(status)')
        }

        const game = await Game.new(px, p0, true, 1000, 0);
        await game.confirmGame({ from: p0 })

        await game.step(1, { from: px })
        await checkWinner(1, 1, game, false, px)
        await game.step(9, { from: p0 })
        await checkWinner(1, 2, game, false, p0)
        await game.step(2, { from: px })
        await checkWinner(1, 3, game, false, px)
        await game.step(5, { from: p0 })
        await checkWinner(1, 4, game, false, p0)
        await game.step(3, { from: px })
        await checkWinner(1, 5, game, true, px)



        
        const game2 = await Game.new(px, p0, true, 1000, 0);
        await game2.confirmGame({ from: p0 })

        await game2.step(1, { from: px })
        await checkWinner(2, 1, game2, false, px)
        await game2.step(2, { from: p0 })
        await checkWinner(2, 2, game2, false, p0)
        await game2.step(9, { from: px })
        await checkWinner(2, 3, game2, false, px)
        await game2.step(5, { from: p0 })
        await checkWinner(2, 4, game2, false, p0)
        await game2.step(7, { from: px })
        await checkWinner(2, 5, game2, false, px)
        await game2.step(8, { from: p0 })
        await checkWinner(2, 6, game2, true, p0)


        
        const game3 = await Game.new(px, p0, true, 1000, 0);
        await game3.confirmGame({ from: p0 })

        await game3.step(5, { from: px })
        await checkWinner(3, 1, game3, false, px)
        await game3.step(6, { from: p0 })
        await checkWinner(3, 2, game3, false, p0)
        await game3.step(9, { from: px })
        await checkWinner(3, 3, game3, false, px)
        await game3.step(8, { from: p0 })
        await checkWinner(3, 4, game3, false, p0)
        await game3.step(1, { from: px })
        await checkWinner(3, 5, game3, true, px)
    })

    it('Проверка статусов', async () => {
        const px = accounts[0],
            p0 = accounts[1];
    })

})
