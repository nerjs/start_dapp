const checkOwned = require('./custom/owned')
const et = require('../utils/error_tests')


const GameBase = artifacts.require('GameBaseTest')

contract('GameBase', accounts => {
	checkOwned(GameBase, accounts, false)
})
