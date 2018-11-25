const { parseNumber } = require('./check_events')



const mess = exports.message = (txt, message) => `${txt}${message && '  [ ' + message + ' ]'}`


const isArray = exports.isArray = (list, message) => {
	assert(Array.isArray(list), mess('Список должен быть массивом', message));
}


exports.inList = (list, item, message) => {
	isArray(list, message)

	assert(list.indexOf(item) >= 0, mess('Элемент должен присутствовать в массиве', message));
}



exports.notInList = (list, item, message) => {
	isArray(list, message)

	assert(list.indexOf(item) < 0, mess('Элемент не должен присутствовать в массиве', message));
}


exports.equalMeta = (list1, list2, message) => {
	isArray(list1, `list_1 ${message && '  ( '+message+' )'}`)
	isArray(list2, `list_2 ${message && '  ( '+message+' )'}`)
	assert.equal(list1.length, list2.length, mess('Длинна массивов не совпадает', message));
}

exports.strictEqual = (list1, list2, message) => {
	exports.equalMeta(list1, list2, message);
	list1.forEach( (item, i) => {
		assert.equal(item, list2[i], mess(`[${i}] Элементы не совпадают`,message));
	})
}


exports.equal = (list1, list2, message) => {
	exports.equalMeta(list1, list2, message);
	list1.forEach( (item, i) => {
		assert(list2.indexOf(item) >= 0, mess(`[${i}] Элементы не совпадают`,message));
	})
}

exports.startData = async (contract, _arr) => {
	isArray(_arr);
	const arr = _arr.filter((d, i) => {
		if (typeof d === 'string') {
			assert(!!contract[d], `Свойство [ ${d} ] не присутствует в контракте`);
			assert.equal(typeof contract[d], 'function', `Метод [ ${d} ] нне является функцией`);
			return false;
		} else if (typeof d === 'object' && ((d.n && typeof d.n === 'string') || (d.name && typeof d.name === 'string')) ) {
			
			return true;
		} 
		throw new Error(`Неправильный формат: [index:${i}], [${JSON.stringify(d)}]`)
	}).map( d => {
		const pr = contract[(d.n || d.name)]()
		pr._result = d.r === undefined ? d.result : d.r
		return pr;
	} )

	const res = await Promise.all(arr);
	arr.forEach((d, i) => {
		assert.equal(parseNumber(res[i]), d._result, `Ошибка соответствия. Метод ${d.n || d.name}. [index:${i}]`);
	})
}