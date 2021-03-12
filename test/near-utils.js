const fs = require('fs');
const nearAPI = require('near-api-js');
const getConfig = require('../src/config');
const { nodeUrl, networkId, contractName, contractMethods } = getConfig(true);
const {
	keyStores: { InMemoryKeyStore },
	Near, Account, Contract, KeyPair,
	utils: {
		format: {
			parseNearAmount
		}
	}
} = nearAPI;

const credentials = JSON.parse(fs.readFileSync(process.env.HOME + '/.near-credentials/default/' + contractName + '.json'));
const keyStore = new InMemoryKeyStore();
keyStore.setKey(networkId, contractName, KeyPair.fromString(credentials.private_key));
const near = new Near({
	networkId, nodeUrl,
	deps: { keyStore },
});
const { connection } = near;
const contractAccount = new Account(connection, contractName);
contractAccount.addAccessKey = (publicKey) => contractAccount.addKey(publicKey, contractName, contractMethods.changeMethods, parseNearAmount('0.1'));
const contract = new Contract(contractAccount, contractName, contractMethods);

module.exports = {
	near,
	keyStore,
	connection,
	contract,
	contractName,
	contractAccount,
	contractMethods,
};