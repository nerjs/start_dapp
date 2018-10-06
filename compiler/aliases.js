const path = require('path');
const settings = require('./settings')
// -- ALIASES ---------------------
module.exports = {
	styled : path.join(settings.from, 'styled'),
	comp : path.join(settings.from, 'components'),
	utils : path.join(settings.from, 'utils'),
	hocs : path.join(settings.from, 'hocs'),
	vendor : path.join(settings.from, 'vendor'),
	icons : 'react-icons/lib'
}