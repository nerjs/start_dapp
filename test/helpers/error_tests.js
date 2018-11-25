module.exports = async (type, fn, message, showError) => {
    let i, y, m;
    try {
        y = await fn();
        i = true;
    } catch(e) {
        i = false;
        m = e.message;
        if (showError) console.log(e.message)
    }
	
	if (i && !type) {
		i = y
	} else if (!i && type) {
		i = m;
	}
    assert.equal(type, i, message)
    return y;
}