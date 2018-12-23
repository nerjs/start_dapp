require('colors')

const getTransaction = hash => new Promise((resolve, reject) => {
	web3.eth.getTransactionReceipt(hash, (err, res) => {
		if (err) return reject(err);
		resolve(res)
	})
})

class CheckGas {
	
	constructor() {
		this._logs = {} 
		this._contracts = {}
		this.maxLength = 0;
		this.maxLengthContract = 0;
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


	async contract(name, c) {
		if (!c) {
			c = name;
			name = 'contract'
		}

		if (name.length > this.maxLengthContract) {
			this.maxLengthContract = name.length
		}

		if (typeof c != 'object' || !c.transactionHash) return console.log('contract.transactionHash is NULL'.red)
		// console.log(web3)
		const tx = await getTransaction(c.transactionHash)
		this._contracts[name] = tx.gasUsed
	}


	async start(...arg) {
		if (arg.length === 0) return console.log('Arguments.length is 0. [CheckGas.start]'.red)
		let [ name, Contract, ...arr] = arg; 
		if (!Contract.new || typeof Contract.new !== 'function') return console.log('Contract must have method new'.red) 

		const contract = await Contract.new(...arr);
		this.contract(name, contract)
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

		if (Object.keys(this._contracts).length > 0) {
			console.log('    -----')
			Object.keys(this._contracts).forEach( key => {
				const prefix = (new Array(this.maxLengthContract - key.length + 4)).join(' ')
				console.log(prefix, ` ${key} `.magentaBG.white, 'gas:'.cyan, `${this._contracts[key]} `.yellow)
			})
		}

	}

	it() {
		it('Потребление газа', async () => {
			this.log()
		})
	}

}


module.exports = CheckGas
