const path = require('path')
const fs = require('fs')

const filePath = path.join(__dirname,'gobal_files.js')

module.exports = function(settings) {
	const name = settings.globalName
	const schema = settings.globals
	str = ''



	schema.forEach(function(f) {
		str = str + 'exports[\'' + f + '\'] = require(\'' + f + '\');\n';
	})

	fs.writeFileSync(filePath, str)

	return filePath
}