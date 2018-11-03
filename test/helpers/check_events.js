
const parseNumber = n => typeof n === 'object' && n.toNumber ? n.toNumber() : n;

const checkEvents = (tx, name, _count, args) => {
    const count = isNaN(Number(_count)) ? 1 : Number(_count);
    assert(Array.isArray(tx.logs), `[event:${name}] tx.logs mustbe Array`);
    assert(tx.logs.length > 0, `[event:${name}] Событий не обнаружено`);

    const arr = [];

    tx.logs.forEach( e => {
        if (e.event === name) {
            arr.push(e);
        }
    })

    assert.equal(arr.length, count, `[event:${name}] Количество событий в логе не совпадает с ожидаемым.`);

    if (arr.length === 0 || count === 0) return;
    if (arr.length > 1) return arr.forEach(e => checkEvents(
        {
            logs: [ e ],
            event: name
        },
        name,
        1,
        args
    ));

    if (!args || typeof args !== 'object' || Object.keys(args).length === 0) return;
    const event = arr[0];
    
    assert.equal(typeof event.args, 'object', `[event:${name}] Отсутствуют аргументы`);

    Object.keys(args).forEach( key => {
        assert.equal(args[key], parseNumber(event.args[key]), `[event:${name}] arg:${key}`);
    } )

}


module.exports = checkEvents