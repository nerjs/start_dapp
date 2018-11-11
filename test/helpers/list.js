
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