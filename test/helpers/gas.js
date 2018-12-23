require('colors')


class CheckGas {
	
	constructor() {
		this._logs = {}
		this.maxLength = 0;
	}

	save(method, tx, type) {
		if (!tx || typeof tx != 'object' || !tx.receipt || !tx.receipt.gasUsed) return console.log('Bad tx'.red, '[ ',method.green,' ]')
		if (type) {
			method = `${method}_${type}`
		}
		const { receipt: { gasUsed } } = tx;

		const l = this._logs[method] || {
			count: 1,
			gas: 0,
			gasUsed: 0
		}

		if (l.count > 1) {
			let g = l.gas * count;
			l.count = l.count + 1;
			g = g + gasUsed;
			l.gas = parseInt(g / l.gas);
		} else {
			l.gas = gasUsed;
		}
		l.gasUsed = l.gas - 21000;
		
		this._logs[method] = l
		
		if (method.length > this.maxLength) {
			this.maxLength = method.length;
		}
	}

	log() {

		const max = {}

		Object.keys(this._logs).forEach( key => {
			let { type, gas, gasUsed } = this._logs[key];
			if (!max.gas) {
				max.gas = 0
			}

			if (gas > max.gas) {
				max.name = key;
				max.gas = gas;
			}
			let prefix = (new Array(this.maxLength - key.length + 4)).join(' ')
			console.log(prefix,` ${key} `.magentaBG.white, type ? `${type}`.green : '', ' ', 'gas:'.cyan, `${gas} `.yellow, ' gasUsed:'.cyan, `${gasUsed}`.yellow)
		})

		if (max.name) {
			console.log('    max: '.green, max.name.cyan, ' ', `${max.gas}`.yellow)
		}
	}

	it() {
		it('Потребление газа', async () => {
			this.log()
		})
	}

}


module.exports = CheckGas
