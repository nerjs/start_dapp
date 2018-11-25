const address = require('./address')
const { parseNumber } = require('./check_events')


exports._PlayerStatus = {
	Empty: 0,         // [ 0 ] Пустой слот
	NotConfirmed: 1,  // [ 1 ] Не подтвердил участие.
	Waiting: 2,       // [ 2 ] Подтвержден и ожидает игры/хода
	Next: 3,          // [ 3 ] Следующий ход за игроком
	Capitulate: 4,    // [ 4 ] Проиграл. Причина - сдался
	LossTimeLimit: 5, // [ 5 ] Проиграл. Причина - истекло время ожидания
	Loss: 6,          // [ 6 ] Проиграл
	Win: 7 ,          // [ 7 ] Победил
	0: 'Empty',         // [ 0 ] Пустой слот
	1: 'NotConfirmed',  // [ 1 ] Не подтвердил участие.
	2: 'Waiting',       // [ 2 ] Подтвержден и ожидает игры/хода
	3: 'Next',          // [ 3 ] Следующий ход за игроком
	4: 'Capitulate',    // [ 4 ] Проиграл. Причина - сдался
	5: 'LossTimeLimit', // [ 5 ] Проиграл. Причина - истекло время ожидания
	6: 'Loss',          // [ 6 ] Проиграл
	7: 'Win'            // [ 7 ] Победил
}
exports.PlayerStatus = n => exports._PlayerStatus[n]


exports._PlayerMoveReason = {
	GameCreate: 0,   // [ 0 ] Добавлен при создании игры
	HostAdded: 1,    // [ 1 ] Добавлен хостом
	SelfAdded: 2,    // [ 2 ] Добавился самостоятельно
	Invite: 3,       // [ 3 ] Добавил один из игроков
	HostRemoved: 4,  // [ 4 ] Удален хостом
	SelfRemoved: 5,  // [ 5 ] Удалился сам
	WaitTime: 6,     // [ 6 ] Истекло время ожидания подтверждения
	BasisPlayers: 7, // [ 7 ] Удален решением игроков
	0: 'GameCreate',   // [ 0 ] Добавлен при создании игры
	1: 'HostAdded',    // [ 1 ] Добавлен хостом
	2: 'SelfAdded',    // [ 2 ] Добавился самостоятельно
	3: 'Invite',       // [ 3 ] Добавил один из игроков
	4: 'HostRemoved',  // [ 4 ] Удален хостом
	5: 'SelfRemoved',  // [ 5 ] Удалился сам
	6: 'WaitTime',     // [ 6 ] Истекло время ожидания подтверждения
	7: 'BasisPlayers'  // [ 7 ] Удален решением игроков
}

exports.PlayerMoveReason = n => exports._PlayerMoveReason[n] 


exports._GameStatus = {
	Waiting: 0,         // [ 0 ] Ожидание начала игры
	WaitingPlayers: 1,  // [ 1 ] Ожидание игроков
	Started: 2,         // [ 2 ] Игра началась
	Ended: 3,           // [ 3 ] Игра закончилась
	0: 'Waiting',         // [ 0 ] Ожидание начала игры
	1: 'WaitingPlayers',  // [ 1 ] Ожидание игроков
	2: 'Started',         // [ 2 ] Игра началась
	3: 'Ended'            // [ 3 ] Игра закончилась
}

exports.GameStatus = n => exports._GameStatus[n]





const PlayerInfo = function(host, addr, confirmEndpoint, steps, status, reason) {
	if (!(this instanceof PlayerInfo)) return new PlayerInfo(host, addr, confirmEndpoint, steps, status, reason);

	let input = [];

	if (Array.isArray(host)) {
		input = host;
	} else if (typeof host == 'object' && host.host !== undefined) {
		input = [host.host, host.addr, host.confirmEndpoint, host.steps, host.status, host.reason];
	} else if (host instanceof PlayerInfo) {
		input = host.toArray();
	} else {
		input = [host, addr, confirmEndpoint, steps, status, reason];
	}

	const obj = this.arrToObject(input);
	Object.keys(obj).forEach(key => {
		this[key] = obj[key]
	})
}

PlayerInfo.prototype.arrToObject = function(arr) {
	if (!Array.isArray(arr) || arr.length < 6) throw new Error(`Плохие параметры для PlayerInfoToObject: ${JSON.stringify(arr)}`)
	const res = {
		host: !!arr[0],
		addr: address(arr[1]) ? arr[1] : address.ADDRESS,
		confirmEndpoint: parseNumber(arr[2]),
		steps: parseNumber(arr[3]),
		status: exports.PlayerStatus(arr[4]),
		reason: exports.PlayerMoveReason(arr[5])
	}

	res.confirmEndpoint = isNaN(Number(res.confirmEndpoint)) ? 0 : Number(res.confirmEndpoint)
	res.steps = isNaN(Number(res.steps)) ? 0 : Number(res.steps);

	if (typeof res.status != 'string' || exports.PlayerStatus(res.status) !== arr[4]) res.status = exports.PlayerStatus(0); 
	if (typeof res.reason != 'string' || exports.PlayerMoveReason(res.reason) !== arr[5]) res.reason = exports.PlayerMoveReason(0); 

	return res;
}

PlayerInfo.prototype.toArray = function() {
	const res = [
		!!this.host,
		address(this.addr) ? this.addr : address.ADDRESS,
		parseNumber(this.confirmEndpoint),
		parseNumber(this.steps),
		exports.PlayerStatus(this.status),
		exports.PlayerMoveReason(this.reason)	 
	];

	res[2] = isNaN(Number(res[2])) ? 0 : Number(res[2])
	res[3] = isNaN(Number(res[3])) ? 0 : Number(res[3])
	res[4] = isNaN(Number(res[4])) ? 0 : Number(res[4])
	res[5] = isNaN(Number(res[5])) ? 0 : Number(res[5])

	if (!exports.PlayerStatus(res[4])) res[4] = 0;
	if (!exports.PlayerMoveReason(res[5])) res[5] = 0;

	return res;
}

PlayerInfo.prototype.toJSON = function() {
	return JSON.stringify({
		host: this.host,
		addr: this.addr,
		confirmEndpoint: this.confirmEndpoint,
		steps: this.steps,
		status: this.status,
		reason: this.reason
	})
}

PlayerInfo.prototype.equal = function(obj) {
	if (!obj || typeof obj !== 'object' || !(obj instanceof PlayerInfo)) return false;
	return this.toJSON() === obj.toJSON();
}

exports.PlayerInfo = PlayerInfo;

exports.pliEqual = (info1, info2) => {
	info1 = exports.PlayerInfo(info1);
	info2 = exports.PlayerInfo(info2);
}
