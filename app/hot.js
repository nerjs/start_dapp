import React from 'react'
import reactDom from 'react-dom'

import App from './app'


const domId = document.getElementById('root')



const render = (Comp) => {
	reactDom.render(<Comp />, domId)
}


render(App)

if(module.hot) {
	module.hot.accept('./app',()=>{
		let NewApp = require('./app').default
		render(NewApp)
	})
}