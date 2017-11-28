describe("Test CRUD Functions", () => {
	const MySQLDatabase = require('../lib/index.js').MySQLDatabase;
	const options = {
		DB_HOST: process.env.DB_HOST || 'localhost',
		DB_CONNECTION_LIMIT: 10,
		DB_USER: process.env.DB_USER || 'root',
		DB_PASS: process.env.DB_PASS || 'changeme',
		DB_DATABASE: process.env.DB_DATABASE || 'TEST'
	};
	const db_params = { table: process.env.DB_TABLE || 'test'};
	console.log('Using Options for DB',options,"\n",db_params,"\n");
	beforeEach(() => {
		sql = new MySQLDatabase(options);
	});

	it("should insertOne document", async () => {
		let result = await sql.insertOne(db_params,{
			name: 'Jasmine',
			email: 'jasmine@gmail.com',
			salary: ~~(Math.random() * 1000000) / 100
		});
		expect(result._id).toBeTruthy();
	});

	it("should find one document", async () => {
		let result = await sql.findOne(db_params);
		expect(result).toBeTruthy();
	});

	it("should find one document", async () => {
		let result = await sql.findOne(db_params);
		expect(result).toBeTruthy();
	});


});
