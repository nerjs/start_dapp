module.exports = async (type, fn, message) => {
    let i;
    try {
        let y = await fn();
        i = true;
    } catch(e) {
        i = false;
    }

    assert.equal(i, !!type, message)
}