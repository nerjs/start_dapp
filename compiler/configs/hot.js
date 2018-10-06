const path = require('path');
const webpack = require('webpack');
const DotEnv = require('dotenv-webpack');

const aliases = require('../aliases')
const utils = require('../utils')
const settings = require('../settings')




const conf = {
	context : settings.from,
	entry : {
		main : [
	    	'react-hot-loader/patch',
	    	'webpack-hot-middleware/client',
			'fetch-polyfill', 
			'./hot.js'
		]
	} ,
	output : {
		filename : './js/[name].js',
		path : settings.to,
		publicPath : '/'
	},
	module : {}
}


//-- DEVTOOL -------------------
conf.devtool = 'inline-source-map';

// conf.devServer = {
// 	hot: true
// }

//--  LOADERS ------------------------------

conf.module.rules = [{
	test: /\.js$/,
	exclude: /node_modules/,
	use : [
	  {
	    loader : 'babel-loader',
	    options : {
	    	presets : [
	    		['env',{
	    		targets : {
	    			browsers : 'last 3 versions'
	    		}
	    	}],'react'],
	    	plugins : [
	    		'transform-class-properties',
	    		["transform-object-rest-spread", { "useBuiltIns": true }],
	    		'transform-runtime',
	    		['babel-plugin-styled-components',{
	    			displayName: true,
	    			fileName: true
	    		}],
	    		'react-hot-loader/babel'
	    		]
	    }
	  }
	]
}]





// -- ALIASES ---------------------
conf.resolve = {
	alias : aliases
}

// -- EXTERNALS  -----------------------------

conf.externals = utils.external()

//--  PLUGINS  ----------------------------  

conf.plugins = [
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new DotEnv(),
  new webpack.HotModuleReplacementPlugin()
]




module.exports = conf
