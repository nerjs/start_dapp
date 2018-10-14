const path = require('path');
const webpack = require('webpack');
var ETP = require('extract-text-webpack-plugin');
const DotEnv = require('dotenv-webpack');


const settings = require('../settings')
const gf = require('./g_f')

const filePath = gf(settings)
const uglify = require('../uglify')



const conf = {
	entry : {
		globals : filePath
	},
	output : {
		filename : '[name].js',
		path : settings.to + '/js',
		library : settings.globalName
	},
	module : {}
}

 

conf.plugins = [
  new webpack.NoEmitOnErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new DotEnv(),
]

if (process.env.NODE_ENV === 'production') {
	conf.plugins.push(uglify)
}



module.exports = conf