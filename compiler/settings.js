const path = require('path');


exports.from = path.join(__dirname, '../app')
exports.to = path.join(__dirname, '../server/static')

exports.globalName = '__GLOBAL__'
exports.globals = [
	'react', 
	'react-dom', 
	// 'redux', 
	// 'react-redux', 
	// 'create-redux-store', 
	'styled-components',
	'react-router',
	'react-router-dom',
	'formik',
	'yup'
]

