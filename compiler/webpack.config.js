require('dotenv').config()

const globals = require('./configs/globals')
const dev = require('./configs/dev')
const prod = require('./configs/prod')
const hot = require('./configs/hot')


switch (process.env.WEBPACK_CONFIG_TYPE) {
	case 'prod':
		module.exports = prod;
	break;
	case 'dev':
		module.exports = dev;
	break;
	case 'hot':
		module.exports = hot;
	break;
	default:
		module.exports = globals;
	break;
}
