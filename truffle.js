require('dotenv').config()


module.exports = {
  networks: {
    development: {
      host: process.env.HOST_RPC,
      port: Number(process.env.PORT_RPC),
      network_id: "*" // Match any network id
    }
  }
};