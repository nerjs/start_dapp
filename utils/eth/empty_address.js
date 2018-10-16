module.exports = addr => {
    if (!addr || typeof addr !== 'string') return true;
    return /^0x0+$/.test(addr)
}
