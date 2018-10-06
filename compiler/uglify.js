const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


module.exports =   new UglifyJsPlugin({
	sourceMap : false,
	extractComments: {
		condition: () => ''
	},
	uglifyOptions : {
		ecma : 8,
		warnings: false,
		output : {
			comments: false,
			safari10: true
		},
		compress : {
			pure_funcs: ['console.log', 'console.warn'],
      	global_defs: {
          	"@alert": "console.warn"
      	}
		}
	},
})