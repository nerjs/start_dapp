const path = require('path');
const webpack = require('webpack');
const DotEnv = require('dotenv-webpack');

const aliases = require('../aliases')
const utils = require('../utils')
const settings = require('../settings')
const uglify = require('../uglify')




const conf = {
	context : settings.from,
	entry : {
		main : ['fetch-polyfill', path.join(settings.from,'index.js')]
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

//--  LOADERS ------------------------------

conf.module.rules = [{
	test: /\.js$/,
	exclude: /node_modules/,
	use : [
	  {
	    loader : 'babel-loader',
	    options : {
	    	presets : [['env',{
	    		targets : {
	    			browsers : 'last 5 versions'
	    		}
	    	}],'react'],
	    	plugins : [
	    		'transform-class-properties',
	    		["transform-object-rest-spread", { "useBuiltIns": true }],
	    		'transform-runtime'
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
  uglify
]




module.exports = conf
