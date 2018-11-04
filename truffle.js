require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: process.env.HOST_RPC,
      port: Number(process.env.PORT_RPC),
      network_id: "*", // Match any network id
      gas: 5000000,
      gasPrice: 25000000000,
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      confirmations: 2,
      network_id: 1
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 4
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}