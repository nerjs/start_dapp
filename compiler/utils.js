const settings = require('./settings')
const external = require('./externals')


exports.external = function() {
	var res = {};

	settings.globals.forEach( name => {
		res[name] = `${settings.globalName}['${name}']`
	})

	Object.keys(external).forEach( key => {
		res[key] = external[key]
	})

	return res;
}