const { utils } = require('web3');

exports = module.exports = utils.isAddress

exports.ADDRESS = '0x0000000000000000000000000000000000000000'

exports.is = addr => utils.isAddress(addr) && !exports.empty(addr)

exports.empty = addr => addr === exports.ADDRESS