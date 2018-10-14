const express = require('express')
const path = require('path')
const opn = require('opn');
require('dotenv').config()
const webpack = require('webpack')
const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
require('colors')



const app = express()


// webpack/react hot loader
// 
app.use((req, res, next) => {
	console.log(req.url.yellow)
	next()
})


if (process.env.WEBPACK_CONFIG_TYPE == 'hot') {
const wConf = require('../compiler/configs/hot')
const compiler = webpack(wConf)



app.use(webpackDevMiddleware(compiler, {
	  publicPath: wConf.output.publicPath,
	  noInfo: true,
	  stats: {
	    colors: true,
	  },
	}));
app.use(webpackHotMiddleware(compiler));

}



app.use(express.static(path.join(__dirname, 'static')));


app.use((req, res) => {
	res.sendFile(path.join(__dirname,'./static/index.html'))
})

app.use((err, req, res, next) => {
	console.error(err);
	res.end('Error')
})

app.listen(process.env.PORT, process.env.HOST, err => {
	if (err) return console.error(err);
	console.log('File-server Start!'.yellow + ', ' + ('http://' + process.env.HOST + ':' + process.env.PORT).green)
    // opn('http://' + process.env.CLIENT_HOST + ':' + process.env.CLIENT_PORT);
})

  

