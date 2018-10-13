module.exports = async (fn, message) => {
    let i;
    try {
        await fn();
        i = true;
    } catch(e) {
        i = false;
    }

    assert.equal(i, true, message)
}