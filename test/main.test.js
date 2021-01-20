const nearAPI = require('near-api-js');
const testUtils = require('./test-utils');
const getConfig = require('../src/config');

const { GAS } = getConfig();
const { initConnection, initContract, getAccount, getContract } = testUtils;
const { Account, utils: { format: { parseNearAmount }} } = nearAPI;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
let near, connection;

beforeAll(async () => {
	near = await initConnection();
	connection = near.connection;
});

describe('deploy contract', () => {
	let contractName;
	let alice, bob;

	beforeAll(async () => {
		alice = await getAccount();
		// bob = await getAccount();
		const contract = await initContract(alice.accountId);
		contractName = contract.accountId;
	});

	test('contract hash', async () => {
		let state = (await new Account(connection, contractName)).state();
		expect(state.code_hash).not.toEqual('11111111111111111111111111111111');
	});

	test('check deposit', async () => {
		console.log('alice balance', (await alice.state()).amount);

		const contract = await getContract(alice);
		await contract.deposit({}, GAS, parseNearAmount('1.123'));
		const balance = await contract.get_balance({ account_id: alice.accountId });

		// weird bug where you have to get new Account instance before state will give you latest balance
		alice = await getAccount(alice.accountId);
		expect((await alice.state()).amount).not.toEqual(parseNearAmount('5'));
		expect(balance).toEqual(parseNearAmount('1.123'));
	});

	// contract has the same state (hasn't been redeployed) and "alice" account is the same
	test('check withdraw', async () => {
		const contract = await getContract(alice);
		await contract.withdraw({ amount: parseNearAmount('0.123') }, GAS);
		const balance = await contract.get_balance({ account_id: alice.accountId });
		expect(balance).toEqual(parseNearAmount('1'));
	});

});